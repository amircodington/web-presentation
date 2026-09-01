import { describe, expect, it } from "vitest"
import { MASCOT_BY_ICON, moodFor } from "./cast"
import allocationContent from "@content/activities.json"

describe("castFor", () => {
  it("covers every allocation option in the shipped content", () => {
    const icons = allocationContent.activities
      .flatMap((activity) => ("game" in activity && activity.game?.kind === "allocation"
        ? activity.game.options
        : []))
      .map((option) => option?.icon)
      .filter((icon): icon is string => typeof icon === "string")

    expect(icons.length).toBeGreaterThan(0)
    // A new option in content must arrive with a character, not silently fall
    // back to a coin — a board of identical coins teaches nothing.
    for (const icon of icons) {
      expect(Object.keys(MASCOT_BY_ICON)).toContain(icon)
    }
  })
})

describe("moodFor", () => {
  it("reads as better and better until the pile becomes a concentration", () => {
    expect(moodFor(0, false)).toBe("idle")
    expect(moodFor(1, false)).toBe("happy")
    expect(moodFor(3, false)).toBe("wow")
    expect(moodFor(5, false)).toBe("dizzy")
  })

  it("reacts to a coin held over it whatever it is already holding", () => {
    expect(moodFor(0, true)).toBe("wow")
    expect(moodFor(9, true)).toBe("wow")
  })
})
