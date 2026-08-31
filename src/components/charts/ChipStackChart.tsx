"use client"

import { motion } from "motion/react"
import { Chip, type ChipTone } from "@/components/ui/Chip"
import { toPersianDigits } from "@/lib/format"
import type { AllocationGame } from "@/content/schema/activities"
import type { Allocation } from "@/lib/games/allocation"

interface ChipStackChartProps {
  game: AllocationGame
  allocation: Allocation
}

/**
 * Where the money went, drawn as the stacks of counters the visitor just built.
 *
 * A pie or a bar chart would abstract the split back into a shape the visitor did
 * not make. Stacking the same chips they tapped keeps the result readable as their
 * own decision, and the column heights compare as directly as bars do because every
 * chip is worth the same.
 *
 * Chip colour ramps with risk — paper, gold, red — so the shape of the risk taken
 * is visible before a single word of feedback is read.
 */
export function ChipStackChart({ game, allocation }: ChipStackChartProps) {
  const total = Object.values(allocation).reduce((sum, count) => sum + count, 0)
  const placed = game.options.filter((option) => (allocation[option.id] ?? 0) > 0)
  const tallest = Math.max(1, ...placed.map((option) => allocation[option.id] ?? 0))

  const chipSize = 78
  const overlap = Math.round(chipSize * 0.4)

  return (
    <div
      className="flex items-end justify-center gap-10"
      style={{ height: chipSize + (tallest - 1) * overlap + 104 }}
    >
      {placed.map((option, columnIndex) => {
        const count = allocation[option.id] ?? 0
        const percent = Math.round((count / total) * 100)
        return (
          <div key={option.id} className="flex flex-col items-center gap-4">
            <span
              className="relative block"
              style={{ width: chipSize, height: chipSize + (count - 1) * overlap }}
            >
              {Array.from({ length: count }, (_, tokenIndex) => (
                <motion.span
                  key={tokenIndex}
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: columnIndex * 0.08 + tokenIndex * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-x-0"
                  style={{ bottom: tokenIndex * overlap }}
                >
                  <Chip
                    tone={riskTone(option.risk)}
                    size={chipSize}
                    icon={tokenIndex === count - 1 ? option.icon : undefined}
                  />
                </motion.span>
              ))}
            </span>

            <span className="flex flex-col items-center gap-0.5">
              <b className="text-[32px] font-black text-[var(--kiosk-money)] tabular-nums">
                ٪{toPersianDigits(percent)}
              </b>
              <span className="max-w-[150px] text-center text-[23px] leading-tight text-[var(--kiosk-muted)]">
                {option.label}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function riskTone(risk: AllocationGame["options"][number]["risk"]): ChipTone {
  if (risk === "high") return "accent"
  if (risk === "none") return "paper"
  return "money"
}
