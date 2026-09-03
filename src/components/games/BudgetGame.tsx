"use client"

import { motion } from "motion/react"
import { useState } from "react"
import type { BudgetGame as BudgetGameContent } from "@/content/schema/activities"
import { analyseBudget, applyBudget, rangeFor } from "@/lib/games/budget"
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

  if (asking && !chosen) {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <Figures game={game} state={state} analysis={analyseBudget(game, cuts)} />

        <div className="flex flex-col gap-5">
          <h3 className="text-[38px] leading-tight font-bold text-balance">{game.question}</h3>
          <div className="grid grid-cols-2 gap-4">
            {game.options.map((option) => (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => {
                  play("reveal")
                  setAnswer(option.id)
                }}
                data-sound="own"
                whileTap={{ x: 8, y: 8, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
                className="mat flex min-h-[104px] cursor-pointer items-center gap-5 rounded-[26px] px-7 text-start text-[25px] font-semibold"
              >
                <span className="shrink-0 text-[var(--kiosk-accent)]">
                  <Icon name={option.icon} size={34} />
                </span>
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setAsking(false)}>
            برگرد به بودجه
          </Button>
        </div>
      </div>
    )
  }

  if (chosen) {
    const analysis = analyseBudget(game, cuts)

    return (
      <div className="flex h-full flex-col justify-center gap-5">
        {/*
          What this visitor did, before what they answered. The game used to show
          only the verdict on the multiple choice, so two people who had done
          opposite things to the same budget read the same paragraph.
        */}
        <Figures game={game} state={state} analysis={analysis} />

        <div className="grid min-h-0 grid-cols-3 gap-4">
          {analysis.rules.map((rule, index) => {
            const copy = game.findings[rule]
            if (!copy) return null
            return (
              <motion.div
                key={rule}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mat flex flex-col gap-2 rounded-[26px] px-7 py-5"
              >
                <b className="text-[25px] font-bold text-[var(--kiosk-accent)]">{copy.title}</b>
                <p className="text-[21px] leading-relaxed text-[var(--kiosk-card-muted)]">
                  {copy.body}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[30px] border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-9 py-5 text-[var(--kiosk-on-accent)]"
        >
          <h3 className="text-[30px] font-bold">{chosen.verdict.title}</h3>
          <p className="text-[24px] leading-relaxed opacity-90">{chosen.verdict.body}</p>
        </motion.div>

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
    <div className="flex h-full flex-col gap-3.5">
      <div className="flex shrink-0 items-center justify-between gap-8">
        <p className="text-[27px] font-bold">{game.prompt}</p>
        <Balance state={state} game={game} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 rounded-[28px] border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-8 py-3.5 text-[var(--kiosk-on-accent)]"
      >
        <b className="text-[26px]">{game.shock.title}</b>
        <p className="text-[22px] opacity-90">{game.shock.body}</p>
      </motion.div>

      {/*
        `content-start`, never `content-center`. A centred grid whose rows do not
        fit overflows *both* ways, so the budget lines spilled up under the shock
        banner and down over the question — reading as three layers of the screen
        lying on top of each other.
      */}
      <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-x-8 gap-y-3 overflow-hidden">
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

      <div className="flex shrink-0 items-center justify-center pt-1">
        <Button onClick={() => setAsking(true)}>{game.question} ←</Button>
      </div>
    </div>
  )
}

/** The budget the visitor built, in three numbers. Shown before the question and again with the verdict. */
function Figures({
  game,
  state,
  analysis,
}: {
  game: BudgetGameContent
  state: ReturnType<typeof applyBudget>
  analysis: ReturnType<typeof analyseBudget>
}) {
  return (
    <div className="flex shrink-0 items-center gap-5">
      <Figure
        label="خرج ماه"
        value={`${toPersianDigits(analysis.state.spend)} ${game.unit}`}
        tone="var(--kiosk-card-text)"
      />
      <Figure
        label={game.bufferLabel}
        value={`${toPersianDigits(Math.abs(state.buffer))} ${game.unit}${
          state.buffer >= 0 ? "" : " کسری"
        }`}
        tone={state.buffer >= 0 ? "var(--kiosk-positive)" : "var(--kiosk-accent)"}
      />
      <Figure
        label="آنچه کم کردید"
        value={`${toPersianDigits(analysis.cut)} ${game.unit}`}
        tone="var(--kiosk-card-text)"
      />
    </div>
  )
}

/** One number from the budget the visitor built, large enough to read at distance. */
function Figure({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="mat flex flex-1 flex-col gap-1 rounded-[26px] px-8 py-4">
      <span className="text-[22px] font-medium text-[var(--kiosk-card-muted)]">{label}</span>
      <b className="text-[40px] font-black tabular-nums" style={{ color: tone }}>
        {value}
      </b>
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
    <div className="flex items-center gap-3">
      <span className="w-[34px] shrink-0 text-[var(--kiosk-muted)]">
        <Icon name={icon} size={32} />
      </span>
      <span className="w-[132px] shrink-0 text-[22px] leading-tight font-semibold">{label}</span>

      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--kiosk-accent-soft)_40%,transparent)]">
        <motion.span
          className="block h-full rounded-full bg-[var(--kiosk-money)]"
          animate={{ width: `${Math.max(6, share * 100)}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        />
      </span>

      <span className="w-[58px] shrink-0 text-end text-[24px] font-bold tabular-nums text-[var(--kiosk-money)]">
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
