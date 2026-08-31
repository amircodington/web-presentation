"use client"

import { motion } from "motion/react"
import { toPersianDigits } from "@/lib/format"

interface ScoreGaugeProps {
  /** The score, already rebased onto 0–100. */
  score: number
  animate: boolean
  size?: number
}

const START_ANGLE = 200
const SWEEP = 320
/** The arc's length as a percentage of the full circle, for `pathLength={100}`. */
const TRACK = (SWEEP / 360) * 100

/**
 * The financial-intelligence score, on the dial the attract loop promised.
 *
 * The screen stops people by asking "how much out of 100?", so the answer arrives
 * as a number out of 100 on a meter, not as a ratio of quiz points. The arc is
 * nearly closed rather than a half-circle: a full ring reads as "complete" and a
 * half-circle reads as a fuel gauge, and this is neither — it is a position on a
 * scale the visitor can move.
 */
export function ScoreGauge({ score, animate, size = 300 }: ScoreGaugeProps) {
  const radius = size / 2 - 26
  const centre = size / 2
  const ratio = Math.max(0, Math.min(100, score)) / 100

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden style={{ direction: "ltr" }}>
        {/*
          Both arcs are normalised with pathLength, so the dash lengths below are
          plain percentages of the circumference rather than values that have to
          be recomputed whenever the gauge is drawn at a different size.
        */}
        <g transform={`rotate(${START_ANGLE} ${centre} ${centre})`}>
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            pathLength={100}
            fill="none"
            stroke="var(--kiosk-border)"
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={`${TRACK} 100`}
          />
          <motion.circle
            cx={centre}
            cy={centre}
            r={radius}
            pathLength={100}
            fill="none"
            stroke="var(--kiosk-money)"
            strokeWidth={22}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 100` }}
            animate={{ strokeDasharray: `${TRACK * ratio} 100` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.b
          initial={{ opacity: 0, scale: 0.7 }}
          animate={animate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[var(--kiosk-money)]"
          style={{ fontSize: Math.round(size * 0.34) }}
        >
          {toPersianDigits(Math.round(score))}
        </motion.b>
        <span className="text-[24px] text-[var(--kiosk-muted)]">از ۱۰۰</span>
      </div>
    </div>
  )
}
