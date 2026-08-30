"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { MarketGame as MarketGameContent } from "@/content/schema/activities"
import { toPersianDigits } from "@/lib/format"
import { Button } from "@/components/ui/Button"

interface Props {
  game: MarketGameContent
  onFinish: () => void
}

/**
 * Predict which way each headline moves the price.
 *
 * The point is not the score: it is that the visitor commits to an answer before
 * seeing the explanation. Reading "supply fell so the price rose" teaches far less
 * than being wrong about it once.
 */
export function MarketGame({ game, onFinish }: Props) {
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState<"up" | "down">()
  const [correct, setCorrect] = useState(0)

  const current = game.rounds[round]
  const finished = round >= game.rounds.length

  const price = game.rounds
    .slice(0, round)
    .reduce((value, r) => value + (r.effect === "up" ? r.change : -r.change), game.startPrice)

  if (finished) {
    return (
      <div className="flex h-full flex-col justify-center gap-8 text-center">
        <p className="text-[34px] text-[var(--kiosk-muted)]">درست حدس زدی</p>
        <p className="text-[120px] leading-none font-black text-[var(--kiosk-accent)]">
          {toPersianDigits(correct)} از {toPersianDigits(game.rounds.length)}
        </p>
        <p className="mx-auto max-w-[70%] text-[30px] leading-relaxed text-[var(--kiosk-muted)]">
          قیمت فقط به عرضه و تقاضا وابسته نیست؛ خبر، انتظار و هیجان هم آن را جابه‌جا می‌کنند.
          در ورکشاپ «مسیر ثروت» همین را با بازارهای واقعی ادامه می‌دهیم.
        </p>
        <div className="flex justify-center gap-5">
          <Button onClick={onFinish}>{"تست کامل مالی من ←"}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setRound(0)
              setGuess(undefined)
              setCorrect(0)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const answered = guess !== undefined
  const wasRight = guess === current.effect

  return (
    <div className="flex h-full flex-col justify-center gap-7">
      <div className="flex items-center justify-between gap-8">
        <span className="text-[26px] text-[var(--kiosk-muted)]">
          خبر {toPersianDigits(round + 1)} از {toPersianDigits(game.rounds.length)}
        </span>
        <div className="flex items-baseline gap-3">
          <span className="text-[26px] text-[var(--kiosk-muted)]">قیمت فعلی</span>
          <motion.b
            key={price}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="text-[56px] font-black text-[var(--kiosk-accent)]"
          >
            {toPersianDigits(price)}
          </motion.b>
          <span className="text-[26px] text-[var(--kiosk-muted)]">{game.unit}</span>
        </div>
      </div>

      <div className="card-surface rounded-3xl px-10 py-8">
        <p className="text-[26px] font-semibold text-[var(--kiosk-accent)]">خبر تازه</p>
        <p className="text-[42px] leading-snug font-bold">{current.news}</p>
      </div>

      <AnimatePresence mode="wait">
        {answered ? (
          <motion.div
            key="explain"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5"
          >
            <p className="text-[38px] font-bold">
              {wasRight ? "✅ درست حدس زدی" : "❌ برعکس شد"} — قیمت{" "}
              {current.effect === "up" ? "بالا رفت" : "پایین آمد"}
            </p>
            <p className="text-[28px] leading-relaxed text-[var(--kiosk-muted)]">
              {current.explain}
            </p>
            <div>
              <Button
                onClick={() => {
                  setRound((r) => r + 1)
                  setGuess(undefined)
                }}
              >
                {round + 1 < game.rounds.length ? "خبر بعدی ←" : "نتیجه ←"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="choices" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
            <ChoiceButton
              direction="up"
              onClick={() => {
                setGuess("up")
                if (current.effect === "up") setCorrect((c) => c + 1)
              }}
            />
            <ChoiceButton
              direction="down"
              onClick={() => {
                setGuess("down")
                if (current.effect === "down") setCorrect((c) => c + 1)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChoiceButton({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) {
  const up = direction === "up"
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-surface flex min-h-[140px] cursor-pointer items-center justify-center gap-5 rounded-3xl text-[42px] font-bold"
    >
      <span className="text-[56px]">{up ? "📈" : "📉"}</span>
      {up ? "بالا می‌رود" : "پایین می‌آید"}
    </button>
  )
}
