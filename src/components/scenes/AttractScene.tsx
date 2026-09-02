"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { content } from "@/content/load"
import { NextActivityBadge } from "@/components/kiosk/NextActivityBadge"
import { Logo } from "@/components/ui/Logo"
import { Mascot, type MascotName } from "@/components/ui/Mascot"
import { MotionIcon } from "@/components/ui/MotionIcon"
import { toPersianDigits } from "@/lib/format"
import type { SceneComponentProps } from "@/engine"

/** The cast that greets a visitor, and the order they arrive in. */
const GREETERS: readonly MascotName[] = ["piggy", "rocket", "coin", "shop", "sprout"]

/**
 * The most important scene in the product and the only one most passers-by will
 * ever see. It has roughly three seconds to stop someone walking past — and the
 * someone is usually a child, with a parent a step behind.
 *
 * So the cast is the hero rather than a headline: five characters lined up along
 * the board's track, waving, above two doors. The games door is the loud one,
 * because "بازی" is what a nine-year-old walks toward and the quiz is what they
 * will happily do *after* a game has already made them curious.
 */
export function AttractScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { attract, contextTag } = content.event
  const gameCount = content.activities.activities.filter((item) => item.game).length
  const line = useRotatingLine(attract.rotating, isActive)

  return (
    <div className="scene-surface relative flex h-full w-full flex-col items-center overflow-hidden rounded-[48px] px-20 pt-12 pb-60 text-center">
      <BoardTrack animate={isActive} />

      <header className="relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo height={110} />
          <span className="pill rounded-full px-7 py-2.5 text-[24px] font-semibold">
            {contextTag}
          </span>
        </div>
        <NextActivityBadge />
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4">
        <Greeters animate={isActive} />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="display max-w-[92%] text-[80px] text-balance"
        >
          {attract.hook}
        </motion.h1>

        <div className="flex h-[92px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[86%] text-[34px] leading-snug font-medium text-[var(--kiosk-muted)]"
            >
              {line}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/*
        One door, not two. The screen no longer asks what a visitor wants to do —
        it asks who they are, because every answer downstream depends on that and
        nothing upstream of it can be personalised. Brief §3.
      */}
      <div className="relative z-10 flex w-full items-stretch justify-center gap-8">
        <DoorCard
          onClick={() => camera.goTo("gateway", "dive")}
          tone="accent"
          icon="play"
          title={attract.cta}
          note={`${toPersianDigits(gameCount)} بازی و تجربه، همین‌جا روی صفحه`}
          animate={isActive}
        />
      </div>
    </div>
  )
}

/**
 * Advances the hook's supporting line on a fixed dwell.
 *
 * Held still while the scene is off-camera: an attract loop that keeps ticking in
 * the background wakes up mid-sentence when a visitor returns to it.
 */
function useRotatingLine(lines: readonly string[], animate: boolean): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % lines.length),
      kioskConfig.attractRotateMs,
    )
    return () => clearInterval(timer)
  }, [animate, lines.length])

  return lines[index % lines.length] ?? lines[0]!
}

/**
 * The cast, bobbing on the spot.
 *
 * No two bob on the same period, so the line never resolves into a single
 * marching block — which reads as a looping video rather than as characters.
 */
function Greeters({ animate }: { animate: boolean }) {
  return (
    <div className="flex items-end justify-center gap-4">
      {GREETERS.map((name, index) => (
        <motion.div
          key={name}
          animate={animate ? { y: [0, -18, 0], rotate: [-3, 3, -3] } : { y: 0, rotate: 0 }}
          transition={{
            duration: 2.4 + index * 0.35,
            repeat: animate ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.18,
          }}
        >
          <Mascot name={name} mood={index === 2 ? "wow" : "happy"} size={index === 2 ? 200 : 164} />
        </motion.div>
      ))}
    </div>
  )
}

/** One of the two ways in. A card you press rather than a pill you click. */
function DoorCard({
  onClick,
  tone,
  icon,
  title,
  note,
  animate,
}: {
  onClick: () => void
  tone: "accent" | "paper"
  icon: "play" | "gauge"
  title: string
  note: string
  animate: boolean
}) {
  const accent = tone === "accent"

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ boxShadow: "9px 9px 0 0 var(--kiosk-border)" }}
      whileTap={{ x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
      transition={{ type: "spring", stiffness: 900, damping: 34 }}
      style={{
        background: accent ? "var(--kiosk-accent)" : "var(--kiosk-card)",
        color: accent ? "var(--kiosk-on-accent)" : "var(--kiosk-card-text)",
      }}
      className="flex min-h-[176px] w-[520px] cursor-pointer items-center gap-7 rounded-[40px] border-[4px] border-[var(--kiosk-border)] px-11 text-right"
    >
      <MotionIcon name={icon} size={64} animate={animate} />
      <span className="flex flex-col items-start gap-1">
        <b className="display text-[54px] leading-none">{title}</b>
        <span className="text-[26px] font-medium opacity-75">{note}</span>
      </span>
    </motion.button>
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
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="board-track absolute top-[34%] right-0 left-0 h-[6px]" />
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute top-[34%] right-0 -mt-[27px]"
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
