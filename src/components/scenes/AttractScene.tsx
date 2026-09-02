"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { content } from "@/content/load"
import { NextActivityBadge } from "@/components/kiosk/NextActivityBadge"
import { Logo } from "@/components/ui/Logo"
import { Mascot, type MascotName } from "@/components/ui/Mascot"
import type { World } from "@/content/schema/worlds"
import type { SceneComponentProps } from "@/engine"

/**
 * Where each portal sits, in design-space pixels from the stage's left edge.
 *
 * Fixed coordinates rather than a flex row because the traveller has to fly
 * between them on `transform`, and a transform cannot target a value the layout
 * engine has not resolved yet. The stage is exactly one authored 1920×1080 frame,
 * so these are the real positions on every screen.
 */
const PORTAL_X = [1440, 960, 480] as const
const PORTAL_WIDTH = 400
const PORTAL_HEIGHT = 370
/** The doorways' vertical centre, and so the height the money travels at. */
const TRAVELLER_Y = 410
const TRAVELLER_SIZE = 170

/**
 * What the money has become by the time it reaches each world. The coin is the
 * same coin throughout — it is the visitor's money growing up, which is the whole
 * argument of the product in one loop.
 */
const FORM: Record<World["id"], MascotName> = {
  kids: "piggy",
  teens: "rocket",
  adults: "ingot",
}

/**
 * The screen a passer-by sees, and the only one most of them will ever see.
 *
 * It is a loop, not a poster. A coin enters the kids' world and becomes a piggy
 * bank, carries into the teens' world and becomes a launch, and lands in the
 * adults' world as a bar of gold — while each portal, in turn, lights up in its
 * own colours. In fifteen seconds someone walking past has been told the three
 * worlds exist, that they are different, and that one of them is theirs, without
 * reading a word.
 *
 * The whole frame is one tap target underneath the art. Every visual layer above
 * it is `pointer-events-none`, because people aim at the middle of the screen and
 * a headline that swallows that tap is the most expensive bug this scene can have.
 */
export function AttractScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { attract, contextTag } = content.event
  const worlds = content.worlds.worlds
  const stage = useLoopStage(worlds.length, isActive)
  const current = worlds[stage] ?? worlds[0]!

  return (
    <div className="scene-surface relative h-full w-full overflow-hidden rounded-[48px]">
      <button
        type="button"
        onClick={() => camera.goTo("gateway", "dive")}
        aria-label={`${attract.hook} — ${attract.cta}`}
        className="absolute inset-0 z-0 cursor-pointer"
      />

      <BoardTrack animate={isActive} />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col px-20 pt-12 pb-60">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo height={110} />
            <span className="pill rounded-full px-7 py-2.5 text-[24px] font-semibold">
              {contextTag}
            </span>
          </div>
          <NextActivityBadge />
        </header>

        <div className="flex flex-1 flex-col items-center justify-end gap-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="display text-[88px] text-balance"
          >
            {attract.hook}
          </motion.h1>

          {/*
            The one instruction on the screen, breathing rather than blinking. A
            blink reads as an error state from across a hall; a slow swell reads
            as something waiting for you.
          */}
          <motion.span
            animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 2.4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            className="inline-flex min-h-[88px] items-center rounded-full border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-14 text-[40px] font-bold text-[var(--kiosk-on-accent)]"
            style={{ boxShadow: "9px 9px 0 0 var(--kiosk-border)" }}
          >
            {attract.cta}
          </motion.span>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
        {worlds.map((world, index) => (
          <Portal
            key={world.id}
            world={world}
            x={PORTAL_X[index] ?? PORTAL_X[0]}
            lit={index === stage}
            animate={isActive}
          />
        ))}
        <Traveller world={current} x={PORTAL_X[stage] ?? PORTAL_X[0]} animate={isActive} />
      </div>
    </div>
  )
}

/**
 * Advances the loop one world at a time.
 *
 * Frozen while the scene is off-camera. An attract loop that keeps ticking in the
 * background is halfway through a sentence the moment a visitor returns to it,
 * and it burns frames on a screen nobody is looking at.
 */
function useLoopStage(count: number, animate: boolean): number {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(
      () => setStage((current) => (current + 1) % count),
      kioskConfig.attractLoopMs / count,
    )
    return () => clearInterval(timer)
  }, [animate, count])

  return stage % count
}

/** One world, as a doorway standing on the board in its own colours. */
function Portal({
  world,
  x,
  lit,
  animate,
}: {
  world: World
  x: number
  lit: boolean
  animate: boolean
}) {
  return (
    <motion.div
      data-world={world.id}
      className="absolute flex flex-col items-center justify-end gap-2 rounded-[52px] border-[5px] px-6 pb-7"
      style={{
        left: x,
        top: TRAVELLER_Y - PORTAL_HEIGHT / 2,
        width: PORTAL_WIDTH,
        height: PORTAL_HEIGHT,
        marginLeft: -PORTAL_WIDTH / 2,
        // Light falls in from the top of a doorway. Keeping the world's own
        // ground at the bottom is also what keeps its own text colour legible:
        // reversing it puts cream type on pale gold in the adults' world.
        background: `linear-gradient(to bottom, ${world.palette.accentSoft}, ${world.palette.background})`,
        borderColor: world.palette.border,
      }}
      animate={
        animate && lit
          ? { scale: 1.07, y: -14, boxShadow: `0 0 0 14px ${world.palette.accentSoft}` }
          : { scale: 1, y: 0, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <b className="display text-[38px]" style={{ color: world.palette.text }}>
        {world.display}
      </b>
      <AnimatePresence>
        {lit ? (
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[86%] text-center text-[24px] leading-snug font-medium"
            style={{ color: world.palette.textMuted }}
          >
            {world.attractLine}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * The money, travelling.
 *
 * Position and form change together but not at the same speed: the flight is
 * long and eased, the transformation is a single pop on arrival. Morphing in
 * mid-air reads as a glitch; arriving and *then* becoming something reads as the
 * world doing it to the coin, which is the point.
 */
function Traveller({ world, x, animate }: { world: World; x: number; animate: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: TRAVELLER_Y }}
      animate={{ x: animate ? x : PORTAL_X[0] }}
      transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.div
        animate={animate ? { y: [0, -26, 0] } : { y: 0 }}
        transition={{ duration: 2.2, repeat: animate ? Infinity : 0, ease: "easeInOut" }}
      >
        {/*
          Centred on its anchor in both axes, or the money lands on the doorway's
          own label instead of standing in the doorway. A percentage translate
          rather than a margin: the anchor is a physical `left` in the canvas's
          maths space, and a logical margin would mirror under RTL and send the
          money the wrong way.
        */}
        <div style={{ transform: "translate(-50%, -50%)" }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={world.id}
            initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.2, rotate: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <Mascot name={FORM[world.id]} mood="wow" size={TRAVELLER_SIZE} />
          </motion.div>
        </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * The board's printed track, with coins travelling along it.
 *
 * It is the same journey the canvas is built on, drawn where a child can see it:
 * the stops are ahead of you and something is already moving between them.
 */
function BoardTrack({ animate }: { animate: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      <div className="board-track absolute right-0 left-0 h-[6px]" style={{ top: TRAVELLER_Y + 96 }} />
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute right-0"
          style={{ top: TRAVELLER_Y + 69 }}
          animate={animate ? { x: [0, -1920] } : { x: 0 }}
          transition={{
            duration: 26,
            repeat: animate ? Infinity : 0,
            ease: "linear",
            delay: index * 8.6,
          }}
        >
          <Mascot name="coin" mood="idle" size={54} />
        </motion.div>
      ))}
    </div>
  )
}
