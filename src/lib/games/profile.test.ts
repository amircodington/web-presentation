import { describe, expect, it } from "vitest"
import { buildProfile, levelFor } from "./profile"
import type { ProfileGame } from "@/content/schema/activities"

const game = {
  kind: "profile",
  prompt: "",
  resultTitle: "",
  dimensions: [
    { id: "money", label: "پول", icon: "coins" },
    { id: "risk", label: "ریسک", icon: "gauge" },
  ],
  questions: [
    {
      id: "q1",
      prompt: "",
      insight: "",
      options: [
        { id: "a", label: "", icon: "coins", scores: { money: 3 } },
        { id: "b", label: "", icon: "coins", scores: { money: 0, risk: 2 } },
      ],
    },
    {
      id: "q2",
      prompt: "",
      insight: "",
      options: [
        { id: "a", label: "", icon: "coins", scores: { risk: 4 } },
        { id: "b", label: "", icon: "coins", scores: { risk: 0 } },
      ],
    },
  ],
  levels: [
    { minScore: 0, label: "شروع", message: "" },
    { minScore: 50, label: "در حال رشد", message: "" },
    { minScore: 90, label: "استراتژیست", message: "" },
  ],
} as unknown as ProfileGame

describe("buildProfile", () => {
  it("scores each dimension against what that dimension could have scored", () => {
    // money is reachable only in q1 (max 3); risk in q1 (2) and q2 (4), so max 6.
    const profile = buildProfile(game, { q1: "a", q2: "a" })
    expect(profile.dimensions).toEqual([
      { id: "money", label: "پول", percent: 100 },
      { id: "risk", label: "ریسک", percent: 67 },
    ])
  })

  it("does not cap a dimension that few questions touch", () => {
    const profile = buildProfile(game, { q1: "a" })
    expect(profile.dimensions.find((d) => d.id === "money")?.percent).toBe(100)
  })

  it("totals across every dimension, not by averaging them", () => {
    // earned 3 + 4 of an available 3 + 6.
    expect(buildProfile(game, { q1: "a", q2: "a" }).total).toBe(78)
  })

  it("scores zero, and still returns a level, when nothing is answered", () => {
    const profile = buildProfile(game, {})
    expect(profile.total).toBe(0)
    expect(profile.level.label).toBe("شروع")
  })

  it("names the strongest and weakest dimension", () => {
    const profile = buildProfile(game, { q1: "a", q2: "b" })
    expect(profile.strongest?.id).toBe("money")
    expect(profile.weakest?.id).toBe("risk")
  })
})

describe("levelFor", () => {
  it("returns the highest band the score reaches", () => {
    expect(levelFor(game, 0).label).toBe("شروع")
    expect(levelFor(game, 49).label).toBe("شروع")
    expect(levelFor(game, 50).label).toBe("در حال رشد")
    expect(levelFor(game, 100).label).toBe("استراتژیست")
  })
})
