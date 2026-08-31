"use client"

import { motion } from "motion/react"
import { productById, priceFor } from "@/content/select"
import { formatPrice } from "@/lib/format"
import { bandFor, recommendFor, scoreAnswers, scoreOutOfHundred } from "@/lib/scoring"
import { useSession } from "@/store/session"
import { ScoreGauge } from "@/components/charts/ScoreGauge"
import { Button } from "@/components/ui/Button"
import { Photo } from "@/components/ui/Photo"
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
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-8 rounded-[48px] px-20 pt-14 pb-52">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.85, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-12"
      >
        <ScoreGauge score={scoreOutOfHundred(score)} animate={isActive} />
        <div className="flex flex-col gap-4">
          <p className="text-[26px] font-medium text-[var(--kiosk-money)]">هوش مالی تو</p>
          <h2 className="display max-w-[90%] text-[62px] text-balance">{band.headline}</h2>
          <p className="max-w-[85%] text-[30px] leading-relaxed text-[var(--kiosk-muted)]">
            {band.description}
          </p>
        </div>
      </motion.div>

      <div className="grid h-[330px] grid-cols-2 gap-6">
        {recommended.slice(0, 2).map((id, index) => {
          const product = productById(id)
          if (!product) return null
          const price = priceFor(id)
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => camera.goTo(`course-${id}`, "dive")}
              initial={{ opacity: 0, y: 50 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              className="mat flex cursor-pointer items-stretch gap-7 overflow-hidden rounded-[32px] p-7 text-start"
            >
              {"media" in product && product.media ? (
                <Photo media={product.media} className="w-[34%] shrink-0 rounded-3xl" />
              ) : null}
              <span className="flex flex-1 flex-col gap-3">
                <span className="text-[22px] font-bold text-[var(--kiosk-accent)]">
                  {index === 0 ? "قدم بعدی تو" : "بعد از آن"}
                </span>
                <b className="text-[36px] leading-tight font-bold">{product.title}</b>
                {"summary" in product && product.summary ? (
                  <span className="text-[23px] leading-relaxed text-[var(--kiosk-card-muted)]">
                    {product.summary}
                  </span>
                ) : null}
                <span className="mt-auto flex items-baseline justify-between gap-4">
                  {price.festival !== undefined ? (
                    <b className="text-[28px] font-bold">{formatPrice(price.festival)}</b>
                  ) : price.regular !== undefined ? (
                    <b className="text-[28px] font-bold">{formatPrice(price.regular)}</b>
                  ) : (
                    <span className="text-[23px] text-[var(--kiosk-card-muted)]">
                      قیمت را در غرفه بپرسید
                    </span>
                  )}
                  <span className="text-[26px] font-bold text-[var(--kiosk-accent)]">جزئیات ←</span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="flex gap-6">
        <Button onClick={() => camera.goTo("connect")}>بفرست روی موبایلم</Button>
        <Button variant="ghost" onClick={() => camera.goTo("live")}>
          یک چالش زنده بازی کن
        </Button>
      </div>
    </div>
  )
}
