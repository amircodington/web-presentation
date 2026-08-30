"use client"

import { motion } from "motion/react"
import { activeWorkshops, priceFor } from "@/content/select"
import { formatJalali, formatPrice, toPersianDigits } from "@/lib/format"
import type { SceneComponentProps } from "@/engine"

/** Dated sessions running during the festival. */
export function WorkshopsScene({ state }: SceneComponentProps) {
  const isActive = state === "active"

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-12 rounded-[48px] px-24 py-16">
      <div className="flex flex-col gap-4">
        <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">در همین جشنواره</p>
        <h2 className="text-[72px] leading-[1.15] font-bold">کارگاه‌های حضوری</h2>
      </div>

      <div className="flex flex-col gap-6">
        {activeWorkshops().map((workshop, index) => {
          const price = priceFor(workshop.id)
          return (
            <motion.article
              key={workshop.id}
              initial={{ opacity: 0, x: -60 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-10 rounded-3xl border-2 border-white/10 bg-white/[0.04] px-12 py-9"
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-[44px] font-bold">{workshop.title}</h3>
                <p className="text-[27px] text-[var(--kiosk-muted)]">{workshop.shortDescription}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {workshop.date ? (
                  <span className="text-[30px] font-semibold">{formatJalali(workshop.date)}</span>
                ) : null}
                {workshop.startTime ? (
                  <span className="text-[26px] text-[var(--kiosk-muted)]">
                    ساعت {toPersianDigits(workshop.startTime)}
                  </span>
                ) : null}
                {price.festival !== undefined ? (
                  <span className="text-[32px] font-bold text-[var(--kiosk-accent)]">
                    {formatPrice(price.festival)}
                  </span>
                ) : price.regular !== undefined ? (
                  <span className="text-[32px] font-bold">{formatPrice(price.regular)}</span>
                ) : null}
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
