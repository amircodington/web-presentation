"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { useSession } from "@/store/session"
import type { SceneComponentProps } from "@/engine"

/**
 * One quiz question. The same component serves every question scene — which one
 * it renders comes from `props.questionIndex` in `scenes.json`, so adding a
 * question is a content edit.
 */
export function QuizQuestionScene({ state, camera, props }: SceneComponentProps) {
  const isActive = state === "active"
  const index = Number(props.questionIndex ?? 0)
  const question = content.quiz.questions[index]
  const answer = useSession((store) => store.answer)
  const chosen = useSession((store) => (question ? store.answers[question.id] : undefined))

  if (!question) return null

  const total = content.quiz.questions.length

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-12 rounded-[48px] px-24 pt-16 pb-52">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <span className="text-[26px] font-semibold text-[var(--kiosk-accent)]">
            سؤال {toPersianDigits(index + 1)} از {toPersianDigits(total)}
          </span>
          <ProgressRail current={index} total={total} />
        </div>

        <h2 className="max-w-[90%] text-[68px] leading-[1.18] font-bold text-balance">
          {question.prompt}
        </h2>

        {question.hint ? (
          <p className="text-[28px] text-[var(--kiosk-muted)]">{question.hint}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {question.options.map((option, optionIndex) => {
          const isChosen = chosen === option.id
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => {
                answer(question.id, option.id)
                camera.next()
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.35, delay: optionIndex * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              className={`min-h-[128px] rounded-3xl border-2 px-10 text-start text-[36px] font-semibold transition-colors duration-[var(--duration-instant)] ${
                isChosen
                  ? "border-[var(--kiosk-accent)] bg-[var(--kiosk-accent)]/15 text-[var(--kiosk-accent)]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {option.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function ProgressRail({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="h-2 flex-1 rounded-full transition-colors duration-[var(--duration-base)]"
          style={{
            background:
              index <= current ? "var(--kiosk-accent)" : "color-mix(in oklab, white 12%, transparent)",
          }}
        />
      ))}
    </div>
  )
}
