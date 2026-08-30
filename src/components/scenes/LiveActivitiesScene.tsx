"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import type { SceneComponentProps } from "@/engine"

/**
 * The live mini-workshops running at the stand.
 *
 * The screen advertises the booth's own programme rather than competing with it —
 * a passer-by who sees "next session in 12 minutes" has a reason to stay.
 */
export function LiveActivitiesScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { activities } = content

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-10 rounded-[48px] px-24 pt-14 pb-52">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">همین حالا در غرفه</p>
          <h2 className="text-[62px] leading-[1.15] font-bold">{activities.title}</h2>
          <p className="text-[26px] text-[var(--kiosk-muted)]">
            روی هر کدام بزنید تا نسخه کوتاهش را همین‌جا بازی کنید
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-[26px] text-[var(--kiosk-muted)]">
          <span>{activities.eventHours}</span>
          <span>{activities.cadence}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {activities.activities.map((activity, index) => (
          <motion.button
            key={activity.id}
            type="button"
            onClick={() => camera.goTo(`game-${activity.id}`, "dive")}
            initial={{ opacity: 0, y: 50 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
            className="card-surface flex min-h-[230px] cursor-pointer gap-7 rounded-3xl p-8 text-start"
          >
            <span className="text-[56px] leading-none">{activity.icon}</span>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-baseline gap-4">
                <h3 className="text-[36px] font-bold">{activity.title}</h3>
                <span className="chip rounded-full px-4 py-1 text-[22px]">
                  {toPersianDigits(activity.durationMin)} دقیقه
                </span>
              </div>
              <p className="text-[26px] leading-relaxed text-[var(--kiosk-muted)]">{activity.hook}</p>
              <span className="mt-auto text-[26px] font-semibold text-[var(--kiosk-accent)]">
                همین‌جا امتحان کن ←
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
