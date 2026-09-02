"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { BudgetGame as BudgetGameContent } from "@/content/schema/activities"
import { applyBudget, rangeFor } from "@/lib/games/budget"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/content/schema/common"

interface Props {
  game: BudgetGameContent
  onFinish: () => void
  finishLabel: string
}

/**
 * A household budget, then a shock, then the question of what you actually do.
 *
 * The shock raises the essentials and nothing else, and the essentials cannot be
 * cut back to where they were — which is the whole experience. A visitor spends
 * thirty seconds discovering that the arithmetic no longer closes on the lines
 * they are allowed to touch, and only then is asked what their first move is.
 * Asking that question before they have felt the squeeze gets a rehearsed answer.
 *
 * No figure is printed anywhere: brief §58 keeps the content alive past this
 * festival by describing the pressure rather than quoting it.
 */
export function BudgetGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [cuts, setCuts] = useState<Record<string, number>>({})
  const [answer, setAnswer] = useState<string>()
  const [asking, setAsking] = useState(false)

  const state = applyBudget(game, cuts)
  const chosen = game.options.find((option) => option.id === answer)

  if (chosen) {
    return (
      <div className="flex h-full flex-col justify-center gap-7">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mat rounded-[32px] px-10 py-7"
        >
          <h3 className="text-[38px] font-bold text-[var(--kiosk-accent)]">
            {chosen.verdict.title}
          </h3>
          <p className="text-[27px] leading-relaxed text-[var(--kiosk-card-muted)]">
            {chosen.verdict.body}
          </p>
        </motion.div>

        <p className="text-[26px] text-[var(--kiosk-muted)]">
          {game.bufferLabel}:{" "}
          <b style={{ color: state.buffer >= 0 ? "var(--kiosk-positive)" : "var(--kiosk-accent)" }}>
            {toPersianDigits(Math.abs(state.buffer))} {game.unit}
            {state.buffer >= 0 ? "" : " کسری"}
          </b>
        </p>

        <div className="flex gap-5">
          <Button onClick={onFinish}>{finishLabel}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCuts({})
              setAnswer(undefined)
              setAsking(false)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[29px] font-bold">{game.prompt}</p>
        <Balance state={state} game={game} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-8 py-4 text-[var(--kiosk-on-accent)]"
      >
        <b className="text-[28px]">{game.shock.title}</b>
        <p className="text-[23px] opacity-90">{game.shock.body}</p>
      </motion.div>

      <div className="grid min-h-0 flex-1 grid-cols-2 content-center gap-x-10 gap-y-2.5">
        {state.lines.map((line) => {
          const source = game.lines.find((candidate) => candidate.id === line.id)!
          const range = rangeFor(game, line.id)
          return (
            <Line
              key={line.id}
              icon={source.icon}
              label={line.label}
              amount={line.amount}
              range={range}
              onChange={(next) => {
                play("place")
                setCuts((all) => ({ ...all, [line.id]: next }))
              }}
            />
          )
        })}
      </div>

      <div className="flex min-h-[120px] items-center justify-center">
        <AnimatePresence mode="wait">
          {asking ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col gap-3"
            >
              <p className="text-[28px] font-bold">{game.question}</p>
              <div className="grid grid-cols-2 gap-3">
                {game.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      play("reveal")
                      setAnswer(option.id)
                    }}
                    data-sound="own"
                    className="mat flex min-h-[92px] cursor-pointer items-center gap-4 rounded-[24px] px-6 text-start text-[24px] font-semibold"
                  >
                    <Icon name={option.icon} size={32} />
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={() => setAsking(true)}>{game.question}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** How much one press moves a line. Small enough to tune, big enough to feel. */
const STEP = 2

/**
 * One budget line, adjusted by pressing rather than by dragging.
 *
 * A native range input has a thumb about sixteen pixels across. On glass at
 * standing height that is not a control, it is a coin toss. These are the same
 * size as the games' other steppers — four times the thumb, and hit reliably —
 * and the bar behind them gives the reading the slider was carrying.
 *
 * A line at its floor keeps its button and simply stops moving. A control that
 * goes dead under a finger reads as a broken screen.
 */
function Line({
  icon,
  label,
  amount,
  range,
  onChange,
}: {
  icon: IconName
  label: string
  amount: number
  range: { min: number; max: number }
  onChange: (next: number) => void
}) {
  const locked = range.min === range.max
  const share = range.max > range.min ? (amount - range.min) / (range.max - range.min) : 1

  return (
    <div className="flex items-center gap-4">
      <span className="w-[46px] shrink-0 text-[var(--kiosk-muted)]">
        <Icon name={icon} size={32} />
      </span>
      <span className="w-[168px] shrink-0 text-[24px] font-semibold">{label}</span>

      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--kiosk-accent-soft)_40%,transparent)]">
        <motion.span
          className="block h-full rounded-full bg-[var(--kiosk-money)]"
          animate={{ width: `${Math.max(6, share * 100)}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        />
      </span>

      <span className="w-[74px] shrink-0 text-end text-[26px] font-bold tabular-nums text-[var(--kiosk-money)]">
        {toPersianDigits(amount)}
      </span>

      <span className="flex shrink-0 gap-2" data-sound="own">
        <Step
          label={`کم کردن ${label}`}
          sign="−"
          disabled={locked || amount <= range.min}
          onPress={() => onChange(Math.max(range.min, amount - STEP))}
        />
        <Step
          label={`زیاد کردن ${label}`}
          sign="+"
          disabled={locked || amount >= range.max}
          onPress={() => onChange(Math.min(range.max, amount + STEP))}
        />
      </span>
    </div>
  )
}

function Step({
  label,
  sign,
  disabled,
  onPress,
}: {
  label: string
  sign: string
  disabled: boolean
  onPress: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={label}
      aria-disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      onClickCapture={(event) => {
        if (disabled) event.preventDefault()
      }}
      className="grid h-[68px] w-[68px] cursor-pointer place-items-center rounded-full border-[3px] border-[var(--kiosk-border)] text-[34px] leading-none font-black"
      style={{
        background: "var(--kiosk-card)",
        color: "var(--kiosk-card-text)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {sign}
    </motion.button>
  )
}

/** Income against spend, and the gap between them, as a pressure reading. */
function Balance({
  state,
  game,
}: {
  state: ReturnType<typeof applyBudget>
  game: BudgetGameContent
}) {
  const over = !state.balanced
  return (
    <div className="mat flex items-center gap-7 rounded-[24px] px-8 py-3">
      <span className="flex flex-col leading-tight">
        <span className="text-[20px] text-[var(--kiosk-card-muted)]">درآمد</span>
        <b className="text-[28px] tabular-nums">
          {toPersianDigits(game.income)} {game.unit}
        </b>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[20px] text-[var(--kiosk-card-muted)]">هزینه</span>
        <b className="text-[28px] tabular-nums">{toPersianDigits(state.spend)}</b>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[20px] text-[var(--kiosk-card-muted)]">{game.bufferLabel}</span>
        <motion.b
          key={state.buffer}
          initial={{ scale: 1.14 }}
          animate={{ scale: 1 }}
          className="text-[28px] tabular-nums"
          style={{ color: over ? "var(--kiosk-accent)" : "var(--kiosk-positive)" }}
        >
          {over ? "−" : "+"}
          {toPersianDigits(Math.abs(state.buffer))}
        </motion.b>
      </span>
    </div>
  )
}
