"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { useSession } from "@/store/session"
import { Button } from "@/components/ui/Button"
import type { SceneComponentProps } from "@/engine"

export function QuizIntroScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const reset = useSession((store) => store.reset)

  return (
    <div className="scene-surface flex h-full w-full flex-col items-center justify-center gap-12 rounded-[48px] px-24 pb-52 text-center">
      <motion.span
        animate={isActive ? { y: [0, -18, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-[96px]"
      >
        ⚡
      </motion.span>

      <h2 className="text-[88px] leading-[1.12] font-bold">{content.quiz.title}</h2>
      <p className="max-w-[60%] text-[38px] text-[var(--kiosk-muted)]">{content.quiz.intro}</p>

      <p className="text-[30px] text-[var(--kiosk-accent)]">
        {toPersianDigits(content.quiz.questions.length)} سؤال
      </p>

      <Button
        onClick={() => {
          // Starting fresh here means a visitor who walks up mid-session never
          // inherits the previous person's answers.
          reset()
          camera.goTo("quiz-q1")
        }}
      >
        شروع می‌کنم
      </Button>
    </div>
  )
}
