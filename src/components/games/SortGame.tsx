"use client"

import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { useRef, useState } from "react"
import type { SortGame as SortGameContent } from "@/content/schema/activities"
import { judgeDrop, tallySort, type SortVerdict } from "@/lib/games/sort"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Mascot } from "@/components/ui/Mascot"

interface Props {
  game: SortGameContent
  onFinish: () => void
  finishLabel: string
}

/**
 * Drag each object into "need" or "want".
 *
 * Dragging rather than choosing from a list, because the whole idea is that the
 * object goes *somewhere* and there are only two somewheres. A child feels the
 * decision in the hand before they can express it, which is the youngest world's
 * entire teaching method.
 *
 * Tapping a bin does the same thing. On a 55" screen the far corner is a real
 * reach for a seven-year-old, and a game that only accepts the drag stops
 * working for the shortest visitors.
 */
export function SortGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [verdict, setVerdict] = useState<{ item: string; result: SortVerdict }>()
  const [target, setTarget] = useState<string>()
  const bins = useRef(new Map<string, HTMLDivElement>())

  const remaining = game.items.filter((item) => placements[item.id] === undefined)
  const current = remaining[0]
  const tally = tallySort(game, placements)

  const place = (binId: string) => {
    if (!current) return
    const result = judgeDrop(game, current.id, binId)
    play(result === "wrong" ? "warn" : "good")
    setVerdict({ item: current.id, result })
    setPlacements((all) => ({ ...all, [current.id]: binId }))
  }

  const binAt = (point: { x: number; y: number }): string | undefined => {
    for (const [id, node] of bins.current) {
      const box = node.getBoundingClientRect()
      if (point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom) {
        return id
      }
    }
    return undefined
  }

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-7 text-center">
        <Mascot name="piggy" mood="wow" size={150} />
        <p className="display text-[56px]">{game.praise}</p>
        <p className="text-[34px] text-[var(--kiosk-muted)]">
          {toPersianDigits(tally.right)} از {toPersianDigits(tally.total)} را درست گذاشتی
          {tally.depends > 0 ? ` و ${toPersianDigits(tally.depends)} تا هم «بستگی داره» بود` : ""}
        </p>
        <p className="mat mx-auto max-w-[74%] rounded-[28px] px-9 py-5 text-[27px] leading-relaxed">
          {game.dependsNote}
        </p>
        <div className="flex gap-5">
          <Button onClick={onFinish}>{finishLabel}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPlacements({})
              setVerdict(undefined)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  const shown = verdict?.item === current.id ? undefined : verdict
  const lastItem = shown ? game.items.find((item) => item.id === shown.item) : undefined

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[32px] font-bold">{game.prompt}</p>
        <span className="pill rounded-full px-6 py-2 text-[24px] font-semibold">
          {toPersianDigits(game.items.length - remaining.length)} از{" "}
          {toPersianDigits(game.items.length)}
        </span>
      </div>

      {/* The object in hand, and the verdict on the one just let go of. */}
      <div className="flex min-h-[240px] items-center justify-center gap-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            data-gesture
            drag
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={0.14}
            onDrag={(_: PointerEvent, info: PanInfo) => setTarget(binAt(info.point))}
            onDragEnd={(_: PointerEvent, info: PanInfo) => {
              const bin = binAt(info.point)
              setTarget(undefined)
              if (bin) place(bin)
            }}
            whileDrag={{ scale: 1.18, zIndex: 40 }}
            initial={{ scale: 0.5, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="mat flex cursor-grab flex-col items-center gap-3 rounded-[36px] px-12 py-7 touch-none active:cursor-grabbing"
          >
            <Icon name={current.icon} size={112} />
            <b className="text-[38px]">{current.label}</b>
          </motion.div>
        </AnimatePresence>

        {lastItem && shown ? (
          <motion.div
            key={lastItem.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="mat max-w-[520px] rounded-[28px] px-8 py-5"
          >
            <b
              className="text-[28px]"
              style={{
                color:
                  shown.result === "wrong"
                    ? "var(--kiosk-accent)"
                    : shown.result === "depends"
                      ? "var(--kiosk-money)"
                      : "var(--kiosk-positive)",
              }}
            >
              {shown.result === "depends" ? game.dependsNote : game.praise}
            </b>
            <p className="text-[24px] leading-relaxed text-[var(--kiosk-card-muted)]">
              {lastItem.explain}
            </p>
          </motion.div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {game.bins.map((bin) => (
          <div
            key={bin.id}
            ref={(node) => {
              if (node) bins.current.set(bin.id, node)
              else bins.current.delete(bin.id)
            }}
            data-sound="own"
          >
            <motion.button
              type="button"
              onClick={() => place(bin.id)}
              aria-label={`گذاشتن ${current.label} در ${bin.label}`}
              animate={target === bin.id ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 26 }}
              style={{
                background: target === bin.id ? "var(--kiosk-accent-soft)" : "var(--kiosk-card)",
                boxShadow: "8px 8px 0 0 var(--kiosk-border)",
              }}
              className="flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[36px] border-[4px] border-[var(--kiosk-border)] text-[var(--kiosk-card-text)]"
            >
              <Icon name={bin.icon} size={64} />
              <b className="display text-[46px]">{bin.label}</b>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  )
}
