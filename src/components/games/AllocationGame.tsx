"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { AllocationGame as AllocationGameContent } from "@/content/schema/activities"
import { allocationShares, evaluateAllocation, tokensLeft } from "@/lib/games/allocation"
import { toPersianDigits } from "@/lib/format"
import { Button } from "@/components/ui/Button"

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
  const shares = allocationShares(game, allocation)

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
        <div className="flex flex-wrap gap-3">
          {shares.map((share) => (
            <span
              key={share.id}
              className="chip flex items-center gap-3 rounded-full px-6 py-3 text-[26px]"
            >
              <span className="text-[30px]">{share.icon}</span>
              {share.label}
              <b className="text-[var(--kiosk-accent)]">٪{toPersianDigits(share.percent)}</b>
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {rules.map((rule, index) => {
            const copy = game.feedback[rule]
            if (!copy) return null
            return (
              <motion.div
                key={rule}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="card-surface rounded-3xl p-8"
              >
                <h4 className="text-[34px] font-bold text-[var(--kiosk-accent)]">{copy.title}</h4>
                <p className="text-[26px] leading-relaxed text-[var(--kiosk-muted)]">{copy.body}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="flex gap-5">
          <Button onClick={onFinish}>{"تست کامل مالی من ←"}</Button>
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
    <div className="flex h-full flex-col justify-center gap-7">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[32px] font-semibold">{game.prompt}</p>
        <TokenCounter left={left} total={game.tokens} label={game.tokenLabel} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {game.options.map((option) => {
          const count = allocation[option.id] ?? 0
          return (
            <div
              key={option.id}
              className={`relative rounded-3xl border-2 transition-colors duration-[var(--duration-instant)] ${
                count > 0
                  ? "border-[var(--kiosk-accent)] bg-[var(--kiosk-accent-soft)]"
                  : "card-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => place(option.id)}
                disabled={left === 0}
                aria-label={`افزودن توکن به ${option.label}`}
                className="flex min-h-[168px] w-full cursor-pointer flex-col items-center justify-center gap-2 p-5 disabled:cursor-not-allowed"
              >
                <span className="text-[46px]">{option.icon}</span>
                <span className="text-[27px] font-semibold">{option.label}</span>
                <AnimatePresence mode="popLayout">
                  {count > 0 ? (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 28 }}
                      className="text-[30px] font-black text-[var(--kiosk-accent)]"
                    >
                      {toPersianDigits(count)}×
                    </motion.span>
                  ) : (
                    <span className="text-[24px] text-[var(--kiosk-muted)]">بزن</span>
                  )}
                </AnimatePresence>
              </button>

              {count > 0 ? (
                <button
                  type="button"
                  onClick={() => take(option.id)}
                  aria-label={`برداشتن یک توکن از ${option.label}`}
                  className="absolute top-3 left-3 h-14 w-14 cursor-pointer rounded-full bg-[var(--kiosk-surface)] text-[34px] leading-none font-bold text-[var(--kiosk-accent)] shadow-[0_6px_18px_-8px_rgb(23_19_16/0.5)]"
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

function TokenCounter({ left, total, label }: { left: number; total: number; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <span className="text-[24px] text-[var(--kiosk-muted)]">هر توکن {label} تومان</span>
      <div className="flex gap-1.5" aria-label={`${left} توکن مانده`}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className="h-8 w-8 rounded-full transition-colors duration-[var(--duration-quick)]"
            style={{
              background:
                index < left ? "var(--kiosk-accent)" : "var(--kiosk-border)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
