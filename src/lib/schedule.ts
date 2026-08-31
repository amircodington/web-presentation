import type { ScheduleSlot } from "@/content/schema/event"

/** Minutes since midnight for a wall-clock `HH:MM`. */
export function minutesFromClock(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/** Minutes since midnight for a `Date`, in local time. */
export function minutesOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes()
}

/** Where the booth day currently sits relative to its opening hours. */
export type EventPhase = "before" | "open" | "closed"

export function eventPhase(
  hours: { startTime: string; endTime: string },
  nowMinutes: number,
): EventPhase {
  if (nowMinutes < minutesFromClock(hours.startTime)) return "before"
  if (nowMinutes >= minutesFromClock(hours.endTime)) return "closed"
  return "open"
}

export interface UpcomingSlot {
  slot: ScheduleSlot
  /** Whole minutes until it starts. Zero means it is starting now. */
  minutesUntil: number
}

/**
 * The next mini-activity due to run, or `undefined` once the programme is over
 * for the day.
 *
 * A slot counts as upcoming until its start time passes, not until it finishes:
 * the screen advertises what a visitor can still walk over and join, and someone
 * arriving two minutes into an eight-minute activity has missed the start of it.
 *
 * Pure so the countdown can be tested at any hour of the day without waiting for
 * one — the failure this guards against only appears at 21:45 at the venue.
 */
export function nextSlot(
  schedule: readonly ScheduleSlot[],
  nowMinutes: number,
): UpcomingSlot | undefined {
  let best: UpcomingSlot | undefined
  for (const slot of schedule) {
    const minutesUntil = minutesFromClock(slot.time) - nowMinutes
    if (minutesUntil < 0) continue
    if (!best || minutesUntil < best.minutesUntil) best = { slot, minutesUntil }
  }
  return best
}

/** Every slot, tagged with whether it has already run. Drives the schedule rail. */
export function slotProgress(
  schedule: readonly ScheduleSlot[],
  nowMinutes: number,
): { slot: ScheduleSlot; done: boolean; current: boolean }[] {
  const upcoming = nextSlot(schedule, nowMinutes)
  return schedule.map((slot) => ({
    slot,
    done: minutesFromClock(slot.time) < nowMinutes,
    current: upcoming?.slot === slot,
  }))
}
