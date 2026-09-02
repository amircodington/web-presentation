"use client"

import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { useRef, useState } from "react"
import type { AllocationGame as AllocationGameContent } from "@/content/schema/activities"
import { evaluateAllocation, tokensLeft } from "@/lib/games/allocation"
import { castFor, moodFor } from "@/lib/games/cast"
import { toPersianDigits } from "@/lib/format"
import { ChipStackChart } from "@/components/charts/ChipStackChart"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Mascot } from "@/components/ui/Mascot"

interface Props {
  game: AllocationGameContent
  onFinish: () => void
  /** What the way out is called. The host owns the wording; the game owns the board. */
  finishLabel: string
}

/** How many coins the tray shows at once before it just counts them. */
const TRAY_LIMIT = 10

/**
 * Divide a fixed pot between six characters, by dragging coins onto them.
 *
 * Dragging is the point rather than a flourish: the money is a physical thing you
 * pick up and put somewhere, and it cannot be in two places. That is the entire
 * lesson of opportunity cost, and a child feels it in the hand before reading it.
 *
 * Tapping a character does the same thing. On a 55" screen the far corner is a
 * genuine reach for a nine-year-old, and a game that only accepts the drag simply
 * stops working for the shortest visitors.
 */
export function AllocationGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [allocation, setAllocation] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [target, setTarget] = useState<string>()
  const buckets = useRef(new Map<string, HTMLDivElement>())

  const left = tokensLeft(game, allocation)
  const rules = submitted ? evaluateAllocation(game, allocation) : []

  const place = (id: string) => {
    if (left === 0) return
    play("place")
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

  /** The character under the dragged coin, in client coordinates. */
  const bucketAt = (point: { x: number; y: number }): string | undefined => {
    for (const [id, node] of buckets.current) {
      const box = node.getBoundingClientRect()
      if (
        point.x >= box.left &&
        point.x <= box.right &&
        point.y >= box.top &&
        point.y <= box.bottom
      ) {
        return id
      }
    }
    return undefined
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col justify-center gap-6">
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
          <Button onClick={onFinish}>{finishLabel}</Button>
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
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[30px] font-bold">{game.prompt}</p>
        <span className="pill rounded-full px-6 py-2 text-[23px] font-semibold">
          {game.tokenLabel}
        </span>
      </div>

      <CoinTray
        left={left}
        onDrag={(point) => setTarget(bucketAt(point))}
        onDrop={(point) => {
          const id = bucketAt(point)
          setTarget(undefined)
          if (id) place(id)
        }}
      />

      <div className="grid grid-cols-3 gap-3.5">
        {game.options.map((option) => {
          const count = allocation[option.id] ?? 0
          const isTarget = target === option.id
          return (
            <div
              key={option.id}
              ref={(node) => {
                if (node) buckets.current.set(option.id, node)
                else buckets.current.delete(option.id)
              }}
              className="relative"
              data-sound="own"
            >
              <motion.button
                type="button"
                onClick={() => place(option.id)}
                disabled={left === 0}
                aria-label={`گذاشتن یک سکه در ${option.label}`}
                animate={
                  isTarget
                    ? { scale: 1.06, y: -8 }
                    : count > 0
                      ? { scale: 1, y: 0 }
                      : { scale: 1, y: 0 }
                }
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                style={{
                  background: isTarget ? "var(--kiosk-accent-soft)" : "var(--kiosk-card)",
                  boxShadow: "7px 7px 0 0 var(--kiosk-border)",
                }}
                className="flex min-h-[148px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[30px] border-[4px] border-[var(--kiosk-border)] p-3 disabled:cursor-not-allowed"
              >
                <motion.span
                  animate={isTarget ? { rotate: [-4, 4, -4] } : { rotate: 0 }}
                  transition={{ duration: 0.5, repeat: isTarget ? Infinity : 0 }}
                >
                  <Mascot name={castFor(option.icon)} mood={moodFor(count, isTarget)} size={84} />
                </motion.span>
                <span className="text-[25px] font-bold text-[var(--kiosk-card-text)]">
                  {option.label}
                </span>
                <CoinRow count={count} />
              </motion.button>

              {count > 0 ? (
                <button
                  type="button"
                  onClick={() => take(option.id)}
                  aria-label={`برداشتن یک سکه از ${option.label}`}
                  className="absolute top-3 left-3 grid h-14 w-14 cursor-pointer place-items-center rounded-full border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-money)] text-[34px] leading-none font-black text-[var(--kiosk-border)]"
                >
                  −
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      {/*
        A greyed-out "see the result" button reads as broken to a child, who then
        taps it repeatedly. Until the pot is spent there is no button at all —
        only the count of what is left to place, which is the actual next step.
      */}
      <div className="flex items-center justify-center gap-5">
        {left > 0 ? (
          <span className="pill rounded-full px-10 py-3 text-[30px] font-bold">
            {toPersianDigits(left)} سکه مانده
          </span>
        ) : (
          <Button
            onClick={() => {
              play("reveal")
              setSubmitted(true)
            }}
          >
            نتیجه را ببین
          </Button>
        )}
        {Object.keys(allocation).length > 0 ? (
          <Button variant="ghost" onClick={() => setAllocation({})}>
            پاک کن
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The pot, as coins you can pick up.
 *
 * Every coin is draggable rather than only the top one, so two children at the
 * screen can each grab their own — which is what actually happens at the stand.
 */
function CoinTray({
  left,
  onDrag,
  onDrop,
}: {
  left: number
  onDrag: (point: { x: number; y: number }) => void
  onDrop: (point: { x: number; y: number }) => void
}) {
  const shown = Math.min(left, TRAY_LIMIT)

  return (
    <div className="flex items-center justify-center gap-4">
      <span className="text-[26px] font-semibold text-[var(--kiosk-muted)]">
        {left > 0 ? "سکه‌ها را بکش روی هر کدام که می‌خواهی" : "همه سکه‌ها را گذاشتی"}
      </span>
      <div className="flex h-[76px] items-center">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: shown }, (_, index) => (
            <motion.div
              key={`${left}-${index}`}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={0.16}
              onDrag={(_: PointerEvent, info: PanInfo) => onDrag(info.point)}
              onDragEnd={(_: PointerEvent, info: PanInfo) => onDrop(info.point)}
              whileDrag={{ scale: 1.35, zIndex: 30 }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className="-me-6 cursor-grab touch-none active:cursor-grabbing"
            >
              <Mascot name="coin" mood="happy" size={66} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** What a character is holding, counted in coins rather than in a number. */
function CoinRow({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-[22px] font-medium text-[var(--kiosk-card-muted)]">خالی</span>
  }
  return (
    <span className="flex h-[30px] items-center" aria-label={`${count} سکه`}>
      {Array.from({ length: count }, (_, index) => (
        <motion.span
          key={index}
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 700, damping: 24 }}
          className="-me-2.5"
        >
          <Mascot name="coin" mood="idle" size={30} />
        </motion.span>
      ))}
    </span>
  )
}
