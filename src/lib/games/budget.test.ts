import { describe, expect, it } from "vitest"
import { analyseBudget, applyBudget, rangeFor } from "./budget"
import { content } from "@/content/load"
import type { BudgetGame } from "@/content/schema/activities"

const game = {
  kind: "budget",
  income: 100,
  unit: "",
  prompt: "",
  question: "",
  bufferLabel: "",
  lines: [
    { id: "rent", label: "اجاره", icon: "home", amount: 40, essential: true, floor: 40 },
    { id: "food", label: "خوراک", icon: "food", amount: 20, essential: true, floor: 12 },
    { id: "fun", label: "تفریح", icon: "gift", amount: 20, essential: false, floor: 0 },
    { id: "loan", label: "اقساط", icon: "cash", amount: 10, essential: false, floor: 10 },
    { id: "edu", label: "آموزش", icon: "education", amount: 5, essential: false, floor: 0 },
  ],
  shock: { title: "", body: "", essentialMultiplier: 1.25 },
  options: [],
} as unknown as BudgetGame

describe("applyBudget", () => {
  it("raises only the essentials when the shock lands", () => {
    const state = applyBudget(game, {})
    expect(state.lines.find((l) => l.id === "rent")?.amount).toBe(50)
    expect(state.lines.find((l) => l.id === "fun")?.amount).toBe(20)
  })

  it("leaves the budget in deficit before anything is cut", () => {
    const state = applyBudget(game, {})
    expect(state.spend).toBe(50 + 25 + 20 + 10 + 5)
    expect(state.buffer).toBe(-10)
    expect(state.balanced).toBe(false)
  })

  it("closes once enough discretionary spending is cut", () => {
    const state = applyBudget(game, { fun: 5, edu: 0 })
    expect(state.balanced).toBe(true)
    expect(state.buffer).toBe(10)
  })

  it("refuses to cut a line below its floor", () => {
    expect(applyBudget(game, { loan: 0 }).lines.find((l) => l.id === "loan")?.amount).toBe(10)
  })

  it("shocks an essential's floor too, so the rise cannot be cut away", () => {
    expect(applyBudget(game, { food: 0 }).lines.find((l) => l.id === "food")?.amount).toBe(15)
  })

  it("ignores a cut that tries to raise a line above its shocked amount", () => {
    expect(applyBudget(game, { fun: 999 }).lines.find((l) => l.id === "fun")?.amount).toBe(20)
  })
})

describe("rangeFor", () => {
  it("reports the shocked amount as the ceiling and the shocked floor as the floor", () => {
    expect(rangeFor(game, "food")).toEqual({ min: 15, max: 25 })
    expect(rangeFor(game, "fun")).toEqual({ min: 0, max: 20 })
  })
})

describe("analyseBudget", () => {
  const power = (() => {
    const activity = content.activities.activities.find((a) => a.id === "adults-purchasing-power")
    if (activity?.game?.kind !== "budget") throw new Error("not a budget game")
    return activity.game
  })()

  /** Every line taken to the floor it is allowed to reach. */
  function floorEverything() {
    const shocked = applyBudget(power, {})
    return Object.fromEntries(shocked.lines.map((line) => [line.id, line.floor]))
  }

  it("always says something about a finished budget", () => {
    for (const cuts of [{}, floorEverything(), { leisure: 0 }, { education: 0 }]) {
      expect(analyseBudget(power, cuts).rules.length, JSON.stringify(cuts)).toBeGreaterThan(0)
    }
  })

  it("notices a budget left exactly as the shock made it", () => {
    expect(analyseBudget(power, {}).rules).toContain("untouched")
  })

  it("notices a budget that still does not close", () => {
    expect(analyseBudget(power, {}).rules).toContain("unbalanced")
  })

  it("notices education taken to nothing", () => {
    expect(analyseBudget(power, { education: 0 }).rules).toContain("cutEducation")
  })

  it("notices every discretionary line stripped", () => {
    const analysis = analyseBudget(power, { education: 0, leisure: 0 })
    expect(analysis.rules).toContain("strippedDiscretionary")
    expect(analysis.emptied.length).toBeGreaterThan(0)
  })

  it("separates a budget that closes with room from one that closes on the line", () => {
    const tight = analyseBudget(power, floorEverything())
    expect(tight.state.balanced).toBe(true)
    expect(tight.rules.some((rule) => rule === "keptBuffer" || rule === "noBuffer")).toBe(true)
  })

  it("counts what the player actually removed", () => {
    expect(analyseBudget(power, {}).cut).toBe(0)
    expect(analyseBudget(power, floorEverything()).cut).toBeGreaterThan(0)
  })

  it("reports what the shock added", () => {
    expect(analyseBudget(power, {}).shockCost).toBeGreaterThan(0)
  })
})
