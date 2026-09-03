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
const PORTAL_WIDTH = 340
const PORTAL_HEIGHT = 300
/** The doorways' vertical centre, and so the height the money travels at. */
const TRAVELLER_Y = 340
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
 * adults' world as a bar of gold — while each doorway, in turn, lights up in its
 * own colours. In fifteen seconds someone walking past has been told the three
 * worlds exist, that they are different, and that one of them is theirs, without
 * reading a word.
 *
 * It shows the worlds; it does not ask you to pick one. That distinction is the
 * whole reason this screen and the gateway are two screens rather than one: for a
 * while they both asked the same question under the same three cards, and a
 * visitor who chose on the first screen was asked to choose again on the second,
 * which reads as the kiosk having failed to hear them. The doorways here are
 * scenery the money travels through — arches, unlabelled with sales copy, with no
 * card silhouette and nothing that looks pressable. The single pressable thing is
 * the invitation.
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
            className="display text-[72px] text-balance"
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
            className="inline-flex min-h-[112px] items-center rounded-full border-[5px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-20 text-[50px] font-bold text-[var(--kiosk-on-accent)]"
            style={{ boxShadow: "11px 11px 0 0 var(--kiosk-border)" }}
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

/**
 * One world, as a doorway standing on the board in its own colours.
 *
 * An arch, deliberately: open at the foot, rounded at the head, with its name set
 * beneath it as a place is labelled rather than inside it as a button is. The
 * gateway's cards are square, bordered, and carry a «بزن بریم» — everything here
 * avoids all three, so the two screens cannot be mistaken for each other.
 */
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
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: TRAVELLER_Y - PORTAL_HEIGHT / 2,
        width: PORTAL_WIDTH,
        marginLeft: -PORTAL_WIDTH / 2,
      }}
      animate={animate && lit ? { scale: 1.06, y: -12 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/*
        The world attribute goes on the arch, not on this wrapper. It rescopes the
        palette — including `--kiosk-text` — and the name below the arch is painted
        on the board, not inside the doorway. Scoping it too gave the adults' cream
        ink to a caption sitting on a cream board, and the label vanished.
      */}
      <motion.div
        data-world={world.id}
        className="w-full"
        style={{
          height: PORTAL_HEIGHT,
          // Light falls in from the head of a doorway. Keeping the world's own
          // ground at the foot is also what keeps its name legible beneath it.
          background:
            `linear-gradient(to bottom, ` +
            `color-mix(in oklab, ${world.palette.accent} 28%, ${world.palette.background}), ` +
            `${world.palette.background})`,
          borderTopLeftRadius: PORTAL_WIDTH / 2,
          borderTopRightRadius: PORTAL_WIDTH / 2,
          border: `5px solid ${world.palette.border}`,
          borderBottom: "none",
        }}
        animate={
          animate && lit
            ? { boxShadow: `0 0 0 16px ${world.palette.accentSoft}` }
            : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
        }
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <b
        className="display mt-5 text-[34px]"
        style={{ color: "var(--kiosk-text)", opacity: lit ? 1 : 0.62 }}
      >
        {world.display}
      </b>
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
 *
 * Which is why the form is held back until the flight lands rather than swapped
 * when the target changes. Both were driven off the same value, and because only
 * the position was animated the character changed first and then flew — a rocket
 * standing in the kids' doorway for a second and a half, which says the opposite
 * of what the loop is for.
 */
function Traveller({ world, x, animate }: { world: World; x: number; animate: boolean }) {
  const [arrived, setArrived] = useState(world)

  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: TRAVELLER_Y }}
      animate={{ x: animate ? x : PORTAL_X[0] }}
      transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => setArrived(world)}
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
            key={arrived.id}
            initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.2, rotate: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <Mascot name={FORM[arrived.id]} mood="wow" size={TRAVELLER_SIZE} />
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
