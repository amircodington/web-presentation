"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { ScheduleRail } from "@/components/charts/ScheduleRail"
import { useSchedule } from "@/components/kiosk/useSchedule"
import { Mascot } from "@/components/ui/Mascot"
import { castFor } from "@/lib/games/cast"
import { toPersianDigits } from "@/lib/format"
import type { SceneComponentProps } from "@/engine"

/**
 * The live mini-challenges running at the stand.
 *
 * The screen advertises the booth's own programme rather than competing with it —
 * a passer-by who sees "next one in 12 minutes" has a reason to stay — and lets
 * them play a short version of any of them on the glass while they wait.
 */
export function LiveActivitiesScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { activities, event } = content
  const schedule = useSchedule()

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-6 rounded-[48px] px-20 pt-12 pb-60">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-[26px] font-medium text-[var(--kiosk-money)]">همین حالا در غرفه</p>
          <h2 className="display text-[64px]">{activities.title}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-[25px] text-[var(--kiosk-muted)]">
          <span className="text-[var(--kiosk-text)]">
            {toPersianDigits(event.startTime)} تا {toPersianDigits(event.endTime)}
          </span>
          <span>{event.cadence}</span>
        </div>
      </div>

      {schedule ? <ScheduleRail rows={schedule.rows} /> : null}

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-5">
        {activities.activities.map((activity, index) => {
          const isNext = schedule?.upcoming?.activity.id === activity.id
          return (
            <motion.button
              key={activity.id}
              type="button"
              onClick={() => camera.goTo(`game-${activity.id}`, "dive")}
              initial={{ opacity: 0, y: 50 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              className="mat relative flex cursor-pointer gap-6 rounded-[32px] p-7 text-start"
            >
              <Mascot name={castFor(activity.icon)} mood={isNext ? "wow" : "happy"} size={84} />

              <div className="flex flex-1 flex-col gap-2.5">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-[33px] font-bold">{activity.title}</h3>
                  <span className="pill-on-mat rounded-full px-4 py-1 text-[21px]">
                    {toPersianDigits(activity.durationMin)} دقیقه
                  </span>
                </div>
                <p className="text-[24px] leading-snug text-[var(--kiosk-card-muted)]">
                  {activity.hook}
                </p>

                <div className="flex flex-wrap gap-2">
                  {activity.learning.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="pill-on-mat rounded-full px-3.5 py-0.5 text-[19px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <span className="mt-auto text-[25px] font-bold text-[var(--kiosk-accent)]">
                  همین‌جا امتحان کن ←
                </span>
              </div>

              {isNext ? (
                <span className="absolute -top-4 start-8 rounded-full bg-[var(--kiosk-accent)] px-6 py-2 text-[21px] font-bold text-[var(--kiosk-on-accent)]">
                  {event.nextSlotLabel}
                </span>
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
