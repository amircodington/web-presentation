"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { content } from "@/content/load"
import { NextActivityBadge } from "@/components/kiosk/NextActivityBadge"
import { Chip } from "@/components/ui/Chip"
import { Icon } from "@/components/ui/Icon"
import { Logo } from "@/components/ui/Logo"
import { Photo } from "@/components/ui/Photo"
import type { MediaRef } from "@/content/schema/common"
import type { SceneComponentProps } from "@/engine"

const AMBIENT: MediaRef = {
  kind: "image",
  src: "/media/workshop-board.jpg",
  alt: "نوجوان‌ها دور میز بازی مالی باشگاه ثروت",
  focalPoint: [0.5, 0.42],
}

/**
 * The most important scene in the product and the only one most passers-by will
 * ever see. It has roughly three seconds to stop someone walking past.
 *
 * It stops them with a question rather than a claim — a claim about financial
 * literacy is ignorable, a score out of 100 is not — and the rotating lines keep
 * asking a different one so the screen is never the same twice on a walk past.
 * Behind it sits a photograph of the booth's own session: proof, at a glance,
 * that this is something people are actually doing here rather than a poster.
 */
export function AttractScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { attract, contextTag } = content.event
  const line = useRotatingLine(attract.rotating, isActive)
  const startQuiz = () => camera.goTo("quiz-intro", "dive")

  return (
    <div className="scene-surface relative flex h-full w-full flex-col items-center overflow-hidden rounded-[48px] px-20 pt-14 pb-52 text-center">
      <AmbientPhoto animate={state !== "far"} />
      <DriftingChips animate={isActive} />

      {/*
        The whole surface starts the quiz, not just the pill. Plenty of visitors
        tap the headline or the photo rather than the button, and a screen that
        ignores that reads as broken rather than as decorative.
      */}
      <button type="button" onClick={startQuiz} aria-label={attract.cta} className="absolute inset-0 z-0" />

      <header className="pointer-events-none relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo height={110} />
          <span className="felt rounded-full px-7 py-3 text-[24px] font-medium text-[var(--kiosk-muted)]">
            {contextTag}
          </span>
        </div>
        <NextActivityBadge />
      </header>

      {/*
        Every layer above the tap target opts out of pointer events and the
        controls opt back in. Without this the headline swallows a tap aimed at
        the middle of the screen, which is exactly where people aim.
      */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center gap-9">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="display max-w-[86%] text-[124px] text-balance"
        >
          {attract.hook}
        </motion.h1>

        <div className="flex h-[124px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[70%] text-[44px] leading-snug text-[var(--kiosk-muted)]"
            >
              {line}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-7">
        <motion.button
          type="button"
          onClick={startQuiz}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto inline-flex min-h-[112px] cursor-pointer items-center gap-6 rounded-full bg-[var(--kiosk-accent)] px-16 text-[var(--kiosk-on-accent)] shadow-[0_12px_0_-2px_color-mix(in_oklab,var(--kiosk-accent)_55%,black),0_36px_80px_-28px_var(--kiosk-accent)]"
        >
          <Icon name="play" size={40} />
          <b className="text-[46px] font-black">{attract.cta}</b>
          <span className="text-[26px] font-medium opacity-80">۶۰ ثانیه</span>
        </motion.button>

        <button
          type="button"
          onClick={() => camera.goTo("home", "glide")}
          className="pointer-events-auto inline-flex min-h-[88px] cursor-pointer items-center gap-4 rounded-full border-2 border-[var(--kiosk-card)]/70 bg-[color-mix(in_oklab,var(--kiosk-bg)_70%,black)] px-11 text-[30px] font-bold text-[var(--kiosk-card)]"
        >
          یا همه مسیرها را ببین
          <span aria-hidden className="text-[26px] opacity-70">←</span>
        </button>
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

/** The booth's own session, drifting slowly behind the type. */
function AmbientPhoto({ animate }: { animate: boolean }) {
  return (
    <motion.div
      aria-hidden
      animate={animate ? { scale: [1.08, 1.16, 1.08], x: [0, -28, 0] } : { scale: 1.08 }}
      transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      className="pointer-events-none absolute inset-0 opacity-[0.28]"
    >
      <Photo media={AMBIENT} scrim className="h-full w-full" />
    </motion.div>
  )
}

/**
 * Counters drifting across the table.
 *
 * The kiosk's own object rather than the usual blurred gradient orbs, and slow
 * enough to read as ambient. No two loops share a period, so the field never
 * resolves into a repeating pattern that reads as a frozen screen from a distance.
 */
function DriftingChips({ animate }: { animate: boolean }) {
  const chips = [
    { id: "a", size: 168, x: "6%", y: "14%", tone: "accent", duration: 29, drift: 90 },
    { id: "b", size: 124, x: "84%", y: "62%", tone: "money", duration: 37, drift: -70 },
    { id: "c", size: 96, x: "18%", y: "74%", tone: "board", duration: 43, drift: 60 },
    { id: "d", size: 140, x: "72%", y: "18%", tone: "positive", duration: 33, drift: -84 },
  ] as const

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25">
      {chips.map((chip) => (
        <motion.div
          key={chip.id}
          animate={
            animate ? { y: [0, chip.drift, 0], rotate: [0, chip.drift > 0 ? 22 : -22, 0] } : {}
          }
          transition={{ duration: chip.duration, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", insetInlineStart: chip.x, insetBlockStart: chip.y }}
        >
          <Chip tone={chip.tone} size={chip.size} />
        </motion.div>
      ))}
    </div>
  )
}
