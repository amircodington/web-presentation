"use client"

import { useEffect, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { content } from "@/content/load"
import { eventPhase, minutesOfDay, nextSlot, slotProgress } from "@/lib/schedule"
import type { Activity } from "@/content/schema/activities"
import type { EventPhase, UpcomingSlot } from "@/lib/schedule"

export interface ScheduleView {
  phase: EventPhase
  /** The next mini-activity, with the activity it runs already resolved. */
  upcoming?: UpcomingSlot & { activity: Activity }
  rows: ReturnType<typeof slotProgress>
}

/**
 * The booth's running order, re-read from the clock on a timer.
 *
 * Rendering the clock has to start on the client: the server has no idea what
 * time it is at the venue, and a countdown baked into the HTML would be wrong
 * the moment the page is served. `undefined` until the first tick is the honest
 * state, and callers render the schedule without a countdown until then.
 */
export function useSchedule(): ScheduleView | undefined {
  const [nowMinutes, setNowMinutes] = useState<number>()

  useEffect(() => {
    const read = () => setNowMinutes(minutesOfDay(new Date()))
    read()
    const timer = setInterval(read, kioskConfig.scheduleTickMs)
    return () => clearInterval(timer)
  }, [])

  if (nowMinutes === undefined) return undefined

  const { event, activities } = content
  const upcoming = nextSlot(event.schedule, nowMinutes)
  const activity = upcoming
    ? activities.activities.find((candidate) => candidate.id === upcoming.slot.activityId)
    : undefined

  return {
    phase: eventPhase(event, nowMinutes),
    upcoming: upcoming && activity ? { ...upcoming, activity } : undefined,
    rows: slotProgress(event.schedule, nowMinutes),
  }
}
