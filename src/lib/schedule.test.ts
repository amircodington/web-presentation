import { describe, expect, it } from "vitest"
import {
  eventPhase,
  minutesFromClock,
  minutesOfDay,
  nextSlot,
  slotProgress,
} from "./schedule"

const schedule = [
  { time: "15:30", activityId: "a" },
  { time: "16:00", activityId: "b" },
  { time: "16:30", activityId: "c" },
]

describe("minutesFromClock", () => {
  it("counts minutes since midnight", () => {
    expect(minutesFromClock("00:00")).toBe(0)
    expect(minutesFromClock("15:30")).toBe(930)
    expect(minutesFromClock("22:00")).toBe(1320)
  })
})

describe("minutesOfDay", () => {
  it("reads local wall-clock time off a date", () => {
    expect(minutesOfDay(new Date(2026, 7, 31, 18, 45))).toBe(1125)
  })
})

describe("eventPhase", () => {
  const hours = { startTime: "15:00", endTime: "22:00" }

  it("is before the doors open", () => {
    expect(eventPhase(hours, minutesFromClock("14:59"))).toBe("before")
  })

  it("is open from the start time", () => {
    expect(eventPhase(hours, minutesFromClock("15:00"))).toBe("open")
    expect(eventPhase(hours, minutesFromClock("21:59"))).toBe("open")
  })

  it("is closed once the end time is reached", () => {
    expect(eventPhase(hours, minutesFromClock("22:00"))).toBe("closed")
  })
})

describe("nextSlot", () => {
  it("finds the soonest slot still to come", () => {
    const upcoming = nextSlot(schedule, minutesFromClock("15:45"))
    expect(upcoming?.slot.activityId).toBe("b")
    expect(upcoming?.minutesUntil).toBe(15)
  })

  it("treats a slot starting right now as upcoming", () => {
    const upcoming = nextSlot(schedule, minutesFromClock("16:00"))
    expect(upcoming?.slot.activityId).toBe("b")
    expect(upcoming?.minutesUntil).toBe(0)
  })

  it("returns nothing once the programme is over", () => {
    expect(nextSlot(schedule, minutesFromClock("16:31"))).toBeUndefined()
  })

  it("returns the first slot before the day starts", () => {
    expect(nextSlot(schedule, minutesFromClock("09:00"))?.slot.activityId).toBe("a")
  })
})

describe("slotProgress", () => {
  it("marks past slots done and the soonest one current", () => {
    const rows = slotProgress(schedule, minutesFromClock("15:45"))
    expect(rows.map((row) => row.done)).toEqual([true, false, false])
    expect(rows.map((row) => row.current)).toEqual([false, true, false])
  })

  it("marks nothing current once the programme is over", () => {
    const rows = slotProgress(schedule, minutesFromClock("17:00"))
    expect(rows.every((row) => !row.current)).toBe(true)
    expect(rows.every((row) => row.done)).toBe(true)
  })
})
