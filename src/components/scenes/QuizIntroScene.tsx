"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { useSession } from "@/store/session"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import type { SceneComponentProps } from "@/engine"

/**
 * The bridge between the hook and the questions.
 *
 * It repeats the attract loop's promise in the attract loop's own words — a
 * visitor who tapped "how much out of 100?" and landed on "Short financial quiz"
 * has been handed something they did not ask for.
 */
export function QuizIntroScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const reset = useSession((store) => store.reset)
  const questions = content.quiz.questions.length

  return (
    <div className="scene-surface flex h-full w-full flex-col items-center justify-center gap-10 rounded-[48px] px-24 pb-52 text-center">
      <motion.div
        animate={isActive ? { y: [0, -14, 0] } : {}}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Chip icon="gauge" tone="money" size={144} />
      </motion.div>

      <h2 className="display max-w-[80%] text-[92px] text-balance">
        {content.event.attract.hook}
      </h2>

      <p className="max-w-[58%] text-[36px] leading-relaxed text-[var(--kiosk-muted)]">
        {content.quiz.intro}
      </p>

      <div className="flex items-center gap-4 text-[27px] text-[var(--kiosk-muted)]">
        <span className="pill rounded-full px-6 py-2">
          {toPersianDigits(questions)} سؤال
        </span>
        <span className="pill rounded-full px-6 py-2">کمتر از ۶۰ ثانیه</span>
      </div>

      <Button
        onClick={() => {
          // Starting fresh here means a visitor who walks up mid-session never
          // inherits the previous person's answers.
          reset()
          camera.goTo("quiz-q1")
        }}
      >
        {content.event.attract.cta}
      </Button>
    </div>
  )
}
