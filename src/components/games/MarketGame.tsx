"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { MarketGame as MarketGameContent } from "@/content/schema/activities"
import { priceAfter } from "@/lib/games/market"
import { toPersianDigits } from "@/lib/format"
import { PriceChart } from "@/components/charts/PriceChart"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Mascot } from "@/components/ui/Mascot"
import { MotionIcon } from "@/components/ui/MotionIcon"
import { Icon } from "@/components/ui/Icon"

interface Props {
  game: MarketGameContent
  onFinish: () => void
  /** What the way out is called. The host owns the wording; the game owns the board. */
  finishLabel: string
}

/**
 * Predict which way each headline moves the price, and watch the chart draw the
 * answer.
 *
 * The point is not the score: it is that the visitor commits before seeing the
 * explanation. Reading "supply fell so the price rose" teaches far less than being
 * wrong about it once — and the candle landing the wrong way is what makes being
 * wrong memorable rather than abstract.
 */
export function MarketGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState<"up" | "down">()
  const [correct, setCorrect] = useState(0)

  const current = game.rounds[round]
  const finished = round >= game.rounds.length
  const answered = guess !== undefined
  // The candle for the round in play is drawn only once it has been answered.
  const roundsDrawn = round + (answered ? 1 : 0)

  /** Scores the guess and says so, because a verdict read is a verdict forgotten. */
  const judge = (right: boolean) => {
    if (right) setCorrect((value) => value + 1)
    play(right ? "good" : "warn")
  }

  const restart = () => {
    setRound(0)
    setGuess(undefined)
    setCorrect(0)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-8">
        <span className="text-[25px] text-[var(--kiosk-muted)]">
          {finished
            ? "پایان بازی"
            : `خبر ${toPersianDigits(round + 1)} از ${toPersianDigits(game.rounds.length)}`}
        </span>
        <div className="flex items-center gap-3">
          <motion.span
            animate={
              !answered ? { y: 0 } : current?.effect === "up" ? { y: -14 } : { y: 14 }
            }
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
          >
            <Mascot
              name="rocket"
              mood={!answered ? "idle" : current?.effect === "up" ? "wow" : "dizzy"}
              size={76}
            />
          </motion.span>
          <span className="text-[25px] text-[var(--kiosk-muted)]">قیمت</span>
          <motion.b
            key={roundsDrawn}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="text-[54px] font-black text-[var(--kiosk-money)] tabular-nums"
          >
            {toPersianDigits(priceAfter(game, roundsDrawn))}
          </motion.b>
          <span className="text-[25px] text-[var(--kiosk-muted)]">{game.unit}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <PriceChart game={game} roundsPlayed={roundsDrawn} unit={game.unit} />
      </div>

      {finished ? (
        <div className="flex items-center justify-between gap-8">
          <p className="text-[30px] leading-relaxed text-[var(--kiosk-muted)]">
            درست حدس زدی{" "}
            <b className="text-[44px] font-black text-[var(--kiosk-money)]">
              {toPersianDigits(correct)} از {toPersianDigits(game.rounds.length)}
            </b>{" "}
            — خبر و هیجان هم قیمت را جابه‌جا می‌کنند، نه فقط عرضه و تقاضا.
          </p>
          <div className="flex shrink-0 gap-4">
            <Button onClick={onFinish}>{finishLabel}</Button>
            <Button variant="ghost" onClick={restart}>
              دوباره
            </Button>
          </div>
        </div>
      ) : !current ? null : (
        <>
          <div className="mat rounded-[28px] px-9 py-6">
            <p className="text-[24px] font-bold text-[var(--kiosk-accent)]">خبر تازه</p>
            <p className="text-[38px] leading-snug font-bold">{current.news}</p>
          </div>

          <AnimatePresence mode="wait">
            {answered ? (
              <motion.div
                key="explain"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-8"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <p className="flex items-center gap-3 text-[32px] font-bold">
                    <span
                      style={{
                        color:
                          guess === current.effect
                            ? "var(--kiosk-positive)"
                            : "var(--kiosk-accent)",
                      }}
                    >
                      <Icon name={guess === current.effect ? "check" : "cross"} size={32} />
                    </span>
                    قیمت {current.effect === "up" ? "بالا رفت" : "پایین آمد"}
                  </p>
                  <p className="text-[26px] leading-relaxed text-[var(--kiosk-muted)]">
                    {current.explain}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setRound((value) => value + 1)
                    setGuess(undefined)
                  }}
                >
                  {round + 1 < game.rounds.length ? "خبر بعدی ←" : "نتیجه ←"}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="choices" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
                <ChoiceButton
                  direction="up"
                  onClick={() => {
                    setGuess("up")
                    judge(current.effect === "up")
                  }}
                />
                <ChoiceButton
                  direction="down"
                  onClick={() => {
                    setGuess("down")
                    judge(current.effect === "down")
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

function ChoiceButton({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) {
  const up = direction === "up"
  return (
    <button
      type="button"
      onClick={onClick}
      className="mat mat-press active:mat-press-active flex min-h-[124px] cursor-pointer items-center justify-center gap-5 rounded-[28px] text-[38px] font-bold"
    >
      <span style={{ color: up ? "var(--kiosk-positive)" : "var(--kiosk-accent)" }}>
        <MotionIcon name={up ? "up" : "down"} size={50} />
      </span>
      {up ? "بالا می‌رود" : "پایین می‌آید"}
    </button>
  )
}
