"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { InstalmentGame as InstalmentGameContent } from "@/content/schema/activities"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"

interface Props {
  game: InstalmentGameContent
  onFinish: () => void
  finishLabel: string
}

/**
 * Guess what the instalment plan really costs, then watch it assemble.
 *
 * The guess comes first and that ordering is the entire experience. Shown the
 * total, a visitor reads a number; asked to guess it and then shown the
 * payments stacking up past their guess, they feel the gap — which is the thing
 * brief §39 is trying to teach, because the instalment is sold on the size of the
 * monthly figure and never on the size of the sum.
 */
export function InstalmentGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [guess, setGuess] = useState<number>()
  const [burden, setBurden] = useState<string>()

  const total = game.deposit + game.instalments * game.monthly
  const chosen = game.burden.options.find((option) => option.id === burden)

  if (guess === undefined) {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-[30px] font-bold">{game.prompt}</p>
          <div className="flex gap-5">
            <Plan
              title="نقدی"
              lines={[`${toPersianDigits(game.cashPrice)} ${game.unit}`]}
              icon="cash"
            />
            <Plan
              title="اقساطی"
              lines={[
                `پیش‌پرداخت ${toPersianDigits(game.deposit)} ${game.unit}`,
                `${toPersianDigits(game.instalments)} قسط ${toPersianDigits(game.monthly)} ${game.unit}`,
              ]}
              icon="clock"
            />
          </div>
        </div>

        <p className="text-[32px] font-bold">
          فکر می‌کنی در حالت اقساطی، در مجموع چقدر می‌پردازی؟
        </p>
        <div className="grid grid-cols-3 gap-5">
          {game.guesses.map((candidate) => (
            <motion.button
              key={candidate}
              type="button"
              onClick={() => {
                play("reveal")
                setGuess(candidate)
              }}
              data-sound="own"
              whileTap={{ x: 8, y: 8, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
              className="mat flex min-h-[140px] cursor-pointer items-center justify-center rounded-[30px] text-[46px] font-bold tabular-nums"
            >
              {toPersianDigits(candidate)}
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <PaymentStack game={game} total={total} guess={guess} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mat rounded-[28px] px-9 py-5"
      >
        <h4 className="text-[30px] font-bold text-[var(--kiosk-accent)]">{game.reveal.title}</h4>
        <p className="text-[25px] leading-relaxed text-[var(--kiosk-card-muted)]">
          {game.reveal.body}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {chosen ? (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="flex-1 rounded-[28px] border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-9 py-5 text-[var(--kiosk-on-accent)]">
              <h4 className="text-[30px] font-bold">{chosen.verdict.title}</h4>
              <p className="text-[25px] leading-relaxed opacity-90">{chosen.verdict.body}</p>
            </div>
            <Button onClick={onFinish}>{finishLabel}</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setGuess(undefined)
                setBurden(undefined)
              }}
            >
              دوباره
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="burden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col gap-3"
          >
            <p className="text-[28px] font-bold">{game.burden.prompt}</p>
            <div className="grid grid-cols-3 gap-4">
              {game.burden.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    play("warn")
                    setBurden(option.id)
                  }}
                  data-sound="own"
                  className="mat min-h-[96px] cursor-pointer rounded-[24px] px-6 text-[25px] font-semibold"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** One of the two ways to pay, side by side and equally weighted. */
function Plan({
  title,
  lines,
  icon,
}: {
  title: string
  lines: string[]
  icon: "cash" | "clock"
}) {
  return (
    <div className="mat flex flex-1 items-center gap-5 rounded-[28px] px-8 py-5">
      <Icon name={icon} size={44} />
      <span className="flex flex-col">
        <b className="text-[30px]">{title}</b>
        {lines.map((line) => (
          <span key={line} className="text-[24px] text-[var(--kiosk-card-muted)]">
            {line}
          </span>
        ))}
      </span>
    </div>
  )
}

/**
 * Every payment, assembling into the total, past the line the visitor drew.
 *
 * The guess is drawn as a marker on the same axis rather than reported as a
 * number, so the gap is a distance on screen instead of a subtraction.
 */
function PaymentStack({
  game,
  total,
  guess,
}: {
  game: InstalmentGameContent
  total: number
  guess: number
}) {
  const scale = Math.max(total, guess, game.cashPrice)

  return (
    <div className="flex flex-col gap-5">
      <Axis label="نقدی" value={game.cashPrice} scale={scale} unit={game.unit} tone="var(--kiosk-positive)" delay={0.1} />
      <Axis label="حدس تو" value={guess} scale={scale} unit={game.unit} tone="var(--kiosk-money)" delay={0.35} />
      <div className="flex items-center gap-5">
        <span className="w-[190px] shrink-0 text-[26px] font-semibold">مجموع اقساطی</span>
        <span className="flex h-[46px] flex-1 items-stretch overflow-hidden rounded-full bg-[var(--kiosk-accent-soft)]">
          {[game.deposit, ...Array.from({ length: game.instalments }, () => game.monthly)].map(
            (part, index) => (
              <motion.span
                key={index}
                className="block h-full"
                style={{
                  background:
                    index === 0 ? "var(--kiosk-money)" : "var(--kiosk-accent)",
                  borderInlineEnd: "2px solid var(--kiosk-card)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(part / scale) * 100}%` }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              />
            ),
          )}
        </span>
        <span className="w-[190px] shrink-0 text-[28px] font-bold tabular-nums text-[var(--kiosk-accent)]">
          {toPersianDigits(total)} {game.unit}
        </span>
      </div>
    </div>
  )
}

function Axis({
  label,
  value,
  scale,
  unit,
  tone,
  delay,
}: {
  label: string
  value: number
  scale: number
  unit: string
  tone: string
  delay: number
}) {
  return (
    <div className="flex items-center gap-5">
      <span className="w-[190px] shrink-0 text-[26px] font-semibold">{label}</span>
      <span className="h-[46px] flex-1 overflow-hidden rounded-full bg-[var(--kiosk-accent-soft)]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: tone }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / scale) * 100}%` }}
          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
      <span className="w-[190px] shrink-0 text-[28px] font-bold tabular-nums">
        {toPersianDigits(value)} {unit}
      </span>
    </div>
  )
}
