"use client"

import { motion } from "motion/react"
import { productById, priceFor } from "@/content/select"
import { formatPrice } from "@/lib/format"
import { bandFor, maxScore, recommendFor, scoreAnswers } from "@/lib/scoring"
import { useSession } from "@/store/session"
import { Button } from "@/components/ui/Button"
import type { SceneComponentProps } from "@/engine"

/** The reveal. Dramatic, but under 1.5s — every second here is a second unable to act. */
export function QuizResultScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const answers = useSession((store) => store.answers)
  const audience = useSession((store) => store.audience)

  const score = scoreAnswers(answers)
  const band = bandFor(score)
  const recommended = recommendFor(score, audience)

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-10 rounded-[48px] px-24 pt-14 pb-52">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-8"
      >
        <ScoreDial score={score} max={maxScore()} animate={isActive} />
        <div className="flex flex-col gap-3">
          <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">نتیجه تو</p>
          <h2 className="max-w-[90%] text-[64px] leading-[1.15] font-bold text-balance">
            {band.headline}
          </h2>
        </div>
      </motion.div>

      <p className="max-w-[80%] text-[34px] leading-relaxed text-[var(--kiosk-muted)]">
        {band.description}
      </p>

      <div className="grid grid-cols-2 gap-6">
        {recommended.slice(0, 2).map((id, index) => {
          const product = productById(id)
          if (!product) return null
          const price = priceFor(id)
          return (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 50 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 rounded-3xl border-2 border-[var(--kiosk-accent)]/30 bg-[var(--kiosk-accent)]/[0.07] p-9"
            >
              <span className="text-[24px] font-semibold text-[var(--kiosk-accent)]">پیشنهاد ما</span>
              <h3 className="text-[40px] font-bold">{product.title}</h3>
              {price.festival !== undefined ? (
                <span className="text-[32px] font-bold">{formatPrice(price.festival)}</span>
              ) : price.regular !== undefined ? (
                <span className="text-[32px] font-bold">{formatPrice(price.regular)}</span>
              ) : null}
            </motion.article>
          )
        })}
      </div>

      <div className="flex gap-6">
        <Button onClick={() => camera.goTo("connect")}>اطلاعات بیشتر و ثبت‌نام</Button>
        <Button variant="ghost" onClick={() => camera.home()}>
          بازگشت به ابتدا
        </Button>
      </div>
    </div>
  )
}

/** Circular meter. Drawn with SVG stroke offset so only `transform` and opacity animate. */
function ScoreDial({ score, max, animate }: { score: number; max: number; animate: boolean }) {
  const ratio = max > 0 ? score / max : 0
  const radius = 92
  const circumference = 2 * Math.PI * radius

  return (
    <svg width={220} height={220} viewBox="0 0 220 220" aria-hidden className="shrink-0">
      <circle cx={110} cy={110} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={16} />
      <motion.circle
        cx={110}
        cy={110}
        r={radius}
        fill="none"
        stroke="var(--kiosk-accent)"
        strokeWidth={16}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: animate ? circumference * (1 - ratio) : circumference }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        transform="rotate(-90 110 110)"
      />
    </svg>
  )
}
