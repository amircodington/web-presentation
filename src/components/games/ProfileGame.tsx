"use client"

import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react"
import { useEffect, useState } from "react"
import type { ProfileGame as ProfileGameContent } from "@/content/schema/activities"
import { resolveProfile } from "@/content/select"
import { buildProfile } from "@/lib/games/profile"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"

interface Props {
  game: ProfileGameContent
  onFinish: () => void
  finishLabel: string
}

/** How long the score counts up for. Long enough to watch, short enough to wait. */
const COUNT_MS = 1_600

/**
 * A run of scenario questions that ends in a profile rather than a mark.
 *
 * Every option scores across several dimensions, so there is no wrong answer to
 * be caught out by — which is what makes a visitor answer honestly rather than
 * the way they think they should. The insight after each answer is the teaching;
 * the bars at the end are the payoff.
 *
 * One question per screen, at full size. A list of six questions on one screen is
 * a form, and brief §73 bans form-like UX in every world for the same reason: at
 * a booth, a form is something you walk away from.
 */
export function ProfileGame({ game: source, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const game = resolveProfile(source)
  const questions = game.questions ?? []
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const question = questions[index]
  const answered = question !== undefined && answers[question.id] !== undefined
  const done = index >= questions.length

  const choose = (optionId: string) => {
    if (!question || answered) return
    play("good")
    setAnswers((all) => ({ ...all, [question.id]: optionId }))
  }

  const advance = () => {
    const next = index + 1
    setIndex(next)
    if (next >= questions.length) {
      play("reveal")
      setRevealed(true)
    }
  }

  if (done) {
    return (
      <Result
        game={game}
        answers={answers}
        revealed={revealed}
        onFinish={onFinish}
        finishLabel={finishLabel}
        onRetry={() => {
          setAnswers({})
          setIndex(0)
          setRevealed(false)
        }}
      />
    )
  }

  if (!question) return null

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[26px] font-medium text-[var(--kiosk-muted)]">
          سؤال {toPersianDigits(index + 1)} از {toPersianDigits(questions.length)}
        </p>
        <Progress total={questions.length} done={index} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col justify-center gap-6"
        >
          {question.scenario ? (
            <p className="mat rounded-[28px] px-8 py-4 text-[26px] leading-relaxed">
              {question.scenario}
            </p>
          ) : null}
          <h3 className="text-[42px] leading-tight font-bold text-balance">{question.prompt}</h3>

          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option) => {
              const chosen = answers[question.id] === option.id
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  data-sound="own"
                  whileTap={{ scale: 0.98 }}
                  animate={{ opacity: answered && !chosen ? 0.45 : 1 }}
                  style={{
                    background: chosen ? "var(--kiosk-accent)" : "var(--kiosk-card)",
                    color: chosen ? "var(--kiosk-on-accent)" : "var(--kiosk-card-text)",
                    boxShadow: "7px 7px 0 0 var(--kiosk-border)",
                  }}
                  className="flex min-h-[128px] cursor-pointer items-center gap-5 rounded-[28px] border-[4px] border-[var(--kiosk-border)] px-7 text-start"
                >
                  <Icon name={option.icon} size={44} />
                  <span className="flex flex-col">
                    <b className="text-[29px] leading-tight font-bold">{option.label}</b>
                    {option.detail ? (
                      <span className="text-[22px] opacity-75">{option.detail}</span>
                    ) : null}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex min-h-[112px] items-center gap-6">
        <AnimatePresence>
          {answered ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center gap-6"
            >
              <p className="mat flex-1 rounded-[26px] px-7 py-4 text-[24px] leading-relaxed">
                {question.insight}
              </p>
              <Button onClick={advance}>
                {index + 1 >= questions.length ? "نتیجه‌ام رو ببین" : "بعدی"} ←
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Where the run has got to. Never a score — that would bias the next answer. */
function Progress({ total, done }: { total: number; done: number }) {
  return (
    <span className="flex items-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <motion.span
          key={index}
          className="block h-3 rounded-full"
          animate={{
            width: index === done ? 46 : 22,
            background: index < done ? "var(--kiosk-positive)" : "var(--kiosk-accent-soft)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      ))}
    </span>
  )
}

/**
 * The payoff: a number that counts up, a level that lands, and the bars behind it.
 *
 * The count-up is the whole reason the number is worth showing. A score that
 * simply appears is read; a score that climbs is watched, and a teenager waits
 * for it — which is the moment brief §31 is asking for.
 */
function Result({
  game,
  answers,
  revealed,
  onFinish,
  onRetry,
  finishLabel,
}: {
  game: ProfileGameContent
  answers: Record<string, string>
  revealed: boolean
  onFinish: () => void
  onRetry: () => void
  finishLabel: string
}) {
  const profile = buildProfile(game, answers)
  // The adults' profile carries seven dimensions where the teens' carries four,
  // and the same layout cannot hold both without spilling past the frame. One
  // flag rather than a second component: the difference is density, not design.
  const dense = profile.dimensions.length > 5

  return (
    <div className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="flex min-h-0 items-center justify-between gap-10">
        <div className="flex flex-col gap-2">
          <p className="text-[27px] font-medium text-[var(--kiosk-money)]">{game.resultTitle}</p>
          <CountUp to={profile.total} run={revealed} dense={dense} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: COUNT_MS / 1000, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`display text-[var(--kiosk-accent)] ${dense ? "text-[38px]" : "text-[46px]"}`}
          >
            {profile.level.label}
          </motion.p>
          <p
            className={`max-w-[520px] leading-relaxed text-[var(--kiosk-muted)] ${dense ? "text-[22px]" : "text-[25px]"}`}
          >
            {profile.level.message}
          </p>
        </div>

        <div className={`flex flex-1 flex-col ${dense ? "gap-2" : "gap-3.5"}`}>
          {profile.dimensions.map((dimension, index) => (
            <Bar
              key={dimension.id}
              dimension={dimension}
              index={index}
              run={revealed}
              dense={dense}
            />
          ))}
        </div>
      </div>

      {game.conclusion ? (
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-4"
        >
          <Panel title="نقطه قوت" tone="var(--kiosk-positive)">
            {fill(game.conclusion.strength, profile.strongest?.label)}
          </Panel>
          <Panel title="نقطه قابل بهبود" tone="var(--kiosk-accent)">
            {fill(game.conclusion.improve, profile.weakest?.label)}
          </Panel>
          <Panel title="چارچوب پیشنهادی" tone="var(--kiosk-money)">
            {game.conclusion.framework}
          </Panel>
        </motion.div>
      ) : null}

      {game.disclaimer ? (
        <p className="text-[20px] text-[var(--kiosk-muted)]">{game.disclaimer}</p>
      ) : null}

      <div className="flex gap-5">
        <Button onClick={onFinish}>{finishLabel}</Button>
        <Button variant="ghost" onClick={onRetry}>
          دوباره
        </Button>
      </div>
    </div>
  )
}

/** One third of the closing read-back. */
function Panel({
  title,
  tone,
  children,
}: {
  title: string
  tone: string
  children: React.ReactNode
}) {
  return (
    <div className="mat flex flex-col gap-1.5 rounded-[24px] px-6 py-3.5">
      <b className="text-[23px] font-bold" style={{ color: tone }}>
        {title}
      </b>
      <p className="text-[21px] leading-relaxed text-[var(--kiosk-card-muted)]">{children}</p>
    </div>
  )
}

/**
 * Names the dimension the copy is about.
 *
 * The template stays true whichever dimension came out on top, which is what
 * lets the team rewrite the sentence without knowing the result in advance.
 */
function fill(template: string, dimension?: string): string {
  return template.replace("{dimension}", dimension ?? "")
}

/** The number, climbing. */
function CountUp({ to, run, dense }: { to: number; run: boolean; dense: boolean }) {
  const value = useMotionValue(0)
  const shown = useTransform(value, (current) => toPersianDigits(Math.round(current)))

  useEffect(() => {
    if (!run) return
    const controls = animate(value, to, { duration: COUNT_MS / 1000, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [run, to, value])

  return (
    <p className="display flex items-baseline gap-3 text-[var(--kiosk-money)]">
      <motion.span className={`leading-none tabular-nums ${dense ? "text-[96px]" : "text-[128px]"}`}>
        {shown}
      </motion.span>
      <span className={`text-[var(--kiosk-muted)] ${dense ? "text-[32px]" : "text-[40px]"}`}>
        از {toPersianDigits(100)}
      </span>
    </p>
  )
}

/** One dimension, drawn rather than printed. */
function Bar({
  dimension,
  index,
  run,
  dense,
}: {
  dimension: { id: string; label: string; percent: number }
  index: number
  run: boolean
  dense: boolean
}) {
  return (
    <div className="flex items-center gap-5">
      <span
        className={`w-[230px] shrink-0 leading-tight font-semibold ${dense ? "text-[22px]" : "text-[26px]"}`}
      >
        {dimension.label}
      </span>
      <span
        className={`flex-1 overflow-hidden rounded-full bg-[var(--kiosk-accent-soft)] ${dense ? "h-[18px]" : "h-[26px]"}`}
      >
        <motion.span
          className="block h-full rounded-full bg-[var(--kiosk-positive)]"
          initial={{ width: 0 }}
          animate={{ width: run ? `${dimension.percent}%` : 0 }}
          transition={{ duration: 0.9, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
      <span
        className={`w-[80px] shrink-0 font-bold tabular-nums text-[var(--kiosk-money)] ${dense ? "text-[24px]" : "text-[28px]"}`}
      >
        {toPersianDigits(dimension.percent)}
      </span>
    </div>
  )
}
