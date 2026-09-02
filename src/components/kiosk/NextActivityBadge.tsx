"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { Icon } from "@/components/ui/Icon"
import { toPersianDigits } from "@/lib/format"
import { useSchedule } from "./useSchedule"

/**
 * "Next mini-challenge: 100 Million, 18:30" — the line that turns a passer-by
 * into someone who stays.
 *
 * The countdown is what does the work: a time on its own is a listing, whereas
 * "in 12 minutes" is a reason not to walk away. Below the last slot of the day
 * the badge removes itself rather than advertising a session nobody will run.
 */
export function NextActivityBadge({ className = "" }: { className?: string }) {
  const schedule = useSchedule()
  const upcoming = schedule?.upcoming

  if (!upcoming) return null

  const { minutesUntil, slot, activity } = upcoming
  const soon = minutesUntil <= 10

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`felt flex items-center gap-5 rounded-full py-3 pe-7 ps-5 ${className}`}
    >
      <span
        className="grid h-14 w-14 place-items-center rounded-full"
        style={{
          background: soon ? "var(--kiosk-accent)" : "color-mix(in oklab, var(--kiosk-money) 22%, transparent)",
          color: soon ? "var(--kiosk-on-accent)" : "var(--kiosk-money)",
        }}
      >
        <Icon name={activity.icon} size={30} />
      </span>

      <span className="flex flex-col leading-tight">
        <span className="text-[21px] text-[var(--kiosk-card-muted)]">
          {content.event.nextSlotLabel}
        </span>
        <span className="text-[27px] font-bold">{activity.title}</span>
      </span>

      <span
        className="ms-2 flex flex-col items-center leading-none"
        style={{ color: soon ? "var(--kiosk-accent)" : "var(--kiosk-money)" }}
      >
        <b className="text-[34px] font-black tabular-nums">
          {minutesUntil === 0 ? "الان" : toPersianDigits(minutesUntil)}
        </b>
        <span className="text-[19px] opacity-80">
          {minutesUntil === 0 ? slot.time : "دقیقه دیگر"}
        </span>
      </span>
    </motion.div>
  )
}
