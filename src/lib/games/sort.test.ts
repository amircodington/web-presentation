import { describe, expect, it } from "vitest"
import { judgeDrop, tallySort } from "./sort"
import type { SortGame } from "@/content/schema/activities"

const game = {
  kind: "sort",
  prompt: "",
  bins: [
    { id: "need", label: "نیاز", icon: "basket" },
    { id: "want", label: "خواسته", icon: "gift" },
  ],
  items: [
    { id: "water", label: "آب", icon: "water", verdict: "need", explain: "" },
    { id: "toy", label: "اسباب‌بازی", icon: "toy", verdict: "want", explain: "" },
    { id: "bike", label: "دوچرخه", icon: "bike", verdict: "depends", explain: "" },
    { id: "book", label: "کتاب", icon: "book", verdict: "need", explain: "" },
  ],
  praise: "",
  dependsNote: "",
} as SortGame

describe("judgeDrop", () => {
  it("accepts the matching bin", () => {
    expect(judgeDrop(game, "water", "need")).toBe("right")
  })

  it("rejects the other bin", () => {
    expect(judgeDrop(game, "water", "want")).toBe("wrong")
  })

  it("never marks a `depends` item wrong, whichever bin it lands in", () => {
    expect(judgeDrop(game, "bike", "need")).toBe("depends")
    expect(judgeDrop(game, "bike", "want")).toBe("depends")
  })
})

describe("tallySort", () => {
  it("counts each verdict and keeps the total from the game, not the placements", () => {
    const tally = tallySort(game, { water: "need", toy: "need", bike: "want" })
    expect(tally).toEqual({ right: 1, wrong: 1, depends: 1, total: 4 })
  })

  it("is empty before anything is placed", () => {
    expect(tallySort(game, {})).toEqual({ right: 0, wrong: 0, depends: 0, total: 4 })
  })
})
