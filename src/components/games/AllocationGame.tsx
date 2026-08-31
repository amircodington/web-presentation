"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { AllocationGame as AllocationGameContent } from "@/content/schema/activities"
import { evaluateAllocation, tokensLeft } from "@/lib/games/allocation"
import { toPersianDigits } from "@/lib/format"
import { ChipStackChart } from "@/components/charts/ChipStackChart"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import { Icon } from "@/components/ui/Icon"

interface Props {
  game: AllocationGameContent
  onFinish: () => void
}

/**
 * Divide a fixed pot between options, then read what the split reveals.
 *
 * Tokens are placed by tapping an option rather than dragged onto it: dragging is
 * unreliable through a glass overlay and impossible to undo cleanly with one
 * finger. Each option carries its own remove control so a visitor can correct a
 * single tap without clearing the whole board.
 */
export function AllocationGame({ game, onFinish }: Props) {
  const [allocation, setAllocation] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const left = tokensLeft(game, allocation)
  const rules = submitted ? evaluateAllocation(game, allocation) : []

  const place = (id: string) => {
    if (left === 0) return
    setAllocation((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
  }

  const take = (id: string) => {
    setAllocation((current) => {
      const next = (current[id] ?? 0) - 1
      if (next > 0) return { ...current, [id]: next }
      const rest = { ...current }
      delete rest[id]
      return rest
    })
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col justify-center gap-7">
        <div className="flex items-center justify-center">
          <ChipStackChart game={game} allocation={allocation} />
        </div>

        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => {
            const copy = game.feedback[rule]
            if (!copy) return null
            return (
              <motion.div
                key={rule}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mat rounded-[28px] px-8 py-5"
              >
                <h4 className="text-[30px] font-bold text-[var(--kiosk-accent)]">{copy.title}</h4>
                <p className="text-[24px] leading-relaxed text-[var(--kiosk-card-muted)]">
                  {copy.body}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="flex gap-5">
          <Button onClick={onFinish}>{"هوش مالی‌ام رو محک بزن ←"}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setAllocation({})
              setSubmitted(false)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[31px] font-semibold">{game.prompt}</p>
        <TokenCounter left={left} total={game.tokens} label={game.tokenLabel} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {game.options.map((option) => {
          const count = allocation[option.id] ?? 0
          return (
            <div
              key={option.id}
              className={`relative rounded-[28px] transition-colors duration-[var(--duration-instant)] ${
                count > 0 ? "bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)]" : "mat"
              }`}
            >
              <button
                type="button"
                onClick={() => place(option.id)}
                disabled={left === 0}
                aria-label={`افزودن توکن به ${option.label}`}
                className="flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center gap-2 p-5 disabled:cursor-not-allowed"
              >
                <Icon name={option.icon} size={46} />
                <span className="text-[26px] font-semibold">{option.label}</span>
                <AnimatePresence mode="popLayout">
                  {count > 0 ? (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 28 }}
                      className="text-[30px] font-black"
                    >
                      {toPersianDigits(count)}×
                    </motion.span>
                  ) : (
                    <span className="text-[23px] text-[var(--kiosk-card-muted)]">بزن</span>
                  )}
                </AnimatePresence>
              </button>

              {count > 0 ? (
                <button
                  type="button"
                  onClick={() => take(option.id)}
                  aria-label={`برداشتن یک توکن از ${option.label}`}
                  className="absolute top-3 left-3 grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-[var(--kiosk-card)] text-[34px] leading-none font-bold text-[var(--kiosk-accent)]"
                >
                  −
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-5">
        <Button onClick={() => setSubmitted(true)} className={left > 0 ? "opacity-40" : ""}>
          {left > 0 ? `${toPersianDigits(left)} توکن مانده` : "نتیجه را ببین"}
        </Button>
        {Object.keys(allocation).length > 0 ? (
          <Button variant="ghost" onClick={() => setAllocation({})}>
            پاک کن
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/** The pot still to be placed, drawn as the chips it is made of. */
function TokenCounter({ left, total, label }: { left: number; total: number; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <span className="text-[23px] text-[var(--kiosk-muted)]">هر توکن {label} تومان</span>
      <div className="flex gap-1.5" aria-label={`${left} توکن مانده`}>
        {Array.from({ length: total }, (_, index) => (
          <Chip key={index} tone={index < left ? "money" : "board"} size={34} />
        ))}
      </div>
    </div>
  )
}
