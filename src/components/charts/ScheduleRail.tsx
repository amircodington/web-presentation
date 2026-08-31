"use client"

import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import type { slotProgress } from "@/lib/schedule"

interface ScheduleRailProps {
  rows: ReturnType<typeof slotProgress>
}

/**
 * The whole booth day on one rail, with the slot that is next marked.
 *
 * A visitor asks two things about a programme — "have I missed it?" and "how long
 * until the next one?" — and a list of times answers neither at a glance. Spent
 * slots stay on the rail rather than being dropped: seeing that seven have already
 * run is what makes the eighth look worth waiting for.
 */
export function ScheduleRail({ rows }: ScheduleRailProps) {
  const byActivity = new Map(content.activities.activities.map((item) => [item.id, item]))

  return (
    <div className="flex items-stretch gap-2">
      {rows.map(({ slot, done, current }) => {
        const activity = byActivity.get(slot.activityId)
        return (
          <div key={slot.time} className="flex flex-1 flex-col items-center gap-2">
            <span
              className="h-3 w-full rounded-full"
              style={{
                background: current
                  ? "var(--kiosk-accent)"
                  : done
                    ? "color-mix(in oklab, var(--kiosk-muted) 45%, transparent)"
                    : "var(--kiosk-border)",
              }}
            />
            <span
              className="text-[20px] tabular-nums"
              style={{
                color: current ? "var(--kiosk-accent)" : "var(--kiosk-muted)",
                fontWeight: current ? 700 : 400,
                opacity: done && !current ? 0.45 : 1,
              }}
            >
              {toPersianDigits(slot.time)}
            </span>
            <span className="sr-only">{activity?.title}</span>
          </div>
        )
      })}
    </div>
  )
}
