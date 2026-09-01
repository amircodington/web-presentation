"use client"

import { motion } from "motion/react"
import { Icon } from "./Icon"
import type { IconName } from "@/content/schema/common"

/**
 * An icon with a life of its own.
 *
 * Across a hall, a still screen and a broken screen look identical. These loops
 * are what tell a passer-by the thing is running, and they are chosen by meaning
 * rather than assigned at random: money falls, charts climb, clocks tick. An icon
 * that moves the wrong way is worse than one that sits still, because it teaches
 * the wrong thing to the visitor who is here to learn exactly that.
 *
 * Transform and opacity only, so a screen full of them still holds 60fps on the
 * TV's own media player.
 */
type Loop = "drop" | "rise" | "pulse" | "tick" | "sway"

/** Anything not listed sways. The default is deliberately the quietest loop. */
const LOOPS: Partial<Record<IconName, Loop>> = {
  coins: "drop",
  cash: "drop",
  save: "drop",
  gold: "drop",
  spend: "drop",
  chart: "rise",
  market: "rise",
  up: "rise",
  business: "rise",
  education: "rise",
  play: "pulse",
  spark: "pulse",
  gift: "pulse",
  gauge: "pulse",
  check: "pulse",
  clock: "tick",
}

const KEYFRAMES: Record<Loop, { animate: Record<string, number[]>; duration: number }> = {
  drop: { animate: { y: [0, -9, 0], rotate: [-4, 4, -4] }, duration: 2.6 },
  rise: { animate: { y: [0, -7, 0], scale: [1, 1.07, 1] }, duration: 2.2 },
  pulse: { animate: { scale: [1, 1.14, 1] }, duration: 1.8 },
  tick: { animate: { rotate: [-7, 7, -7] }, duration: 2 },
  sway: { animate: { rotate: [-5, 5, -5], y: [0, -4, 0] }, duration: 3.2 },
}

interface MotionIconProps {
  name: IconName
  size?: number
  /** Held still while the scene is off-camera, so nothing animates unseen. */
  animate?: boolean
  /** Staggers a row of icons so they do not move as one block. */
  delay?: number
  className?: string
}

export function MotionIcon({
  name,
  size = 48,
  animate = true,
  delay = 0,
  className = "",
}: MotionIconProps) {
  const loop = KEYFRAMES[LOOPS[name] ?? "sway"]

  return (
    <motion.span
      className={`inline-grid place-items-center ${className}`}
      animate={animate ? loop.animate : { y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: loop.duration, repeat: animate ? Infinity : 0, ease: "easeInOut", delay }}
    >
      <Icon name={name} size={size} />
    </motion.span>
  )
}
