"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { JudgementGame as JudgementGameContent } from "@/content/schema/activities"
import { toPersianDigits } from "@/lib/format"
import { Button } from "@/components/ui/Button"
import { Mascot } from "@/components/ui/Mascot"
import { MotionIcon } from "@/components/ui/MotionIcon"
import { Icon } from "@/components/ui/Icon"

interface Props {
  game: JudgementGameContent
  onFinish: () => void
}

/**
 * Judge each financial offer as reasonable or suspicious.
 *
 * Every scenario shows its explanation immediately after the answer, right or
 * wrong: the red flags (guaranteed returns, time pressure, certainty) are the
 * lesson, and they only land while the visitor still remembers what they chose.
 */
export function JudgementGame({ game, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<"safe" | "risky">()
  const [correct, setCorrect] = useState(0)

  const scenario = game.scenarios[index]
  const finished = index >= game.scenarios.length

  if (finished) {
    return (
      <div className="flex h-full flex-col justify-center gap-8 text-center">
        <p className="text-[34px] text-[var(--kiosk-muted)]">درست تشخیص دادی</p>
        <p className="display text-[112px] text-[var(--kiosk-money)]">
          {toPersianDigits(correct)} از {toPersianDigits(game.scenarios.length)}
        </p>
        <p className="mx-auto max-w-[70%] text-[30px] leading-relaxed text-[var(--kiosk-muted)]">
          سه نشانه همیشگی: سود تضمینی، فشار زمانی، و قطعیت درباره آینده. هر جا این‌ها را دیدی،
          یک قدم عقب بگذار و منبع را بررسی کن.
        </p>
        <div className="flex justify-center gap-5">
          <Button onClick={onFinish}>{"هوش مالی‌ام رو محک بزن ←"}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setIndex(0)
              setAnswer(undefined)
              setCorrect(0)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  if (!scenario) return null

  const answered = answer !== undefined
  const wasRight = answer === scenario.verdict

  return (
    <div className="flex h-full flex-col justify-center gap-7">
      <div className="flex items-center justify-between gap-6">
        <span className="text-[26px] text-[var(--kiosk-muted)]">
          پیشنهاد {toPersianDigits(index + 1)} از {toPersianDigits(game.scenarios.length)}
        </span>
        <div className="flex gap-2">
          {game.scenarios.map((_, i) => (
            <span
              key={i}
              className="h-3 w-12 rounded-full"
              style={{
                background: i <= index ? "var(--kiosk-money)" : "var(--kiosk-border)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mat rounded-[32px] px-12 py-10">
        <p className="text-[42px] leading-snug font-bold">«{scenario.text}»</p>
      </div>

      <AnimatePresence mode="wait">
        {answered ? (
          <motion.div
            key="explain"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-8"
          >
            <Mascot name="shop" mood={wasRight ? "happy" : "worried"} size={104} />
            <div className="flex flex-1 flex-col gap-5">
            <p className="flex items-center gap-4 text-[36px] font-bold">
              <span
                style={{
                  color: wasRight ? "var(--kiosk-positive)" : "var(--kiosk-accent)",
                }}
              >
                <Icon name={wasRight ? "check" : "cross"} size={36} />
              </span>
              این پیشنهاد {scenario.verdict === "risky" ? game.riskyLabel : game.safeLabel}
            </p>
            <p className="text-[28px] leading-relaxed text-[var(--kiosk-muted)]">
              {scenario.explain}
            </p>
            <div>
              <Button
                onClick={() => {
                  setIndex((i) => i + 1)
                  setAnswer(undefined)
                }}
              >
                {index + 1 < game.scenarios.length ? "پیشنهاد بعدی ←" : "نتیجه ←"}
              </Button>
            </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="choices" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-6">
            <VerdictButton
              tone="risky"
              label={game.riskyLabel}
              onClick={() => {
                setAnswer("risky")
                if (scenario.verdict === "risky") setCorrect((c) => c + 1)
              }}
            />
            <VerdictButton
              tone="safe"
              label={game.safeLabel}
              onClick={() => {
                setAnswer("safe")
                if (scenario.verdict === "safe") setCorrect((c) => c + 1)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * The two verdicts are colour-coded red and green, and each also carries a symbol
 * and a word — colour alone must never be the only signal.
 */
function VerdictButton({
  tone,
  label,
  onClick,
}: {
  tone: "safe" | "risky"
  label: string
  onClick: () => void
}) {
  const risky = tone === "risky"
  return (
    <button
      type="button"
      onClick={onClick}
      className="mat-press active:mat-press-active flex min-h-[140px] cursor-pointer items-center justify-center gap-5 rounded-3xl border-[4px] border-[var(--kiosk-border)] text-[40px] font-bold"
      style={{
        background: risky
          ? "var(--kiosk-accent-soft)"
          : "color-mix(in oklab, var(--kiosk-positive) 20%, var(--kiosk-card))",
        color: risky ? "var(--kiosk-accent)" : "var(--kiosk-positive)",
        boxShadow: "7px 7px 0 0 var(--kiosk-border)",
      }}
    >
      <MotionIcon name={risky ? "flag" : "check"} size={48} />
      {label}
    </button>
  )
}
