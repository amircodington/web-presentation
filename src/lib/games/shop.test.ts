import { describe, expect, it } from "vitest"
import { basketTotal, budgetLeft, canAfford, evaluateBasket } from "./shop"
import type { ShopGame } from "@/content/schema/activities"

const game = {
  kind: "shop",
  prompt: "",
  budget: 100,
  currency: "سکه",
  products: [
    { id: "water", label: "آب", icon: "water", price: 10, essential: true },
    { id: "food", label: "غذا", icon: "food", price: 20, essential: true },
    { id: "pencil", label: "مداد", icon: "pencil", price: 10, essential: true },
    { id: "icecream", label: "بستنی", icon: "icecream", price: 15, essential: false },
    { id: "bike", label: "دوچرخه", icon: "bike", price: 70, essential: false },
  ],
  shortOfMoney: "",
  feedback: {},
} as ShopGame

describe("the purse", () => {
  it("totals what is in the basket", () => {
    expect(basketTotal(game, { water: 2, icecream: 1 })).toBe(35)
    expect(budgetLeft(game, { water: 2, icecream: 1 })).toBe(65)
  })

  it("refuses what will not fit rather than going negative", () => {
    expect(canAfford(game, { bike: 1 }, "bike")).toBe(false)
    expect(canAfford(game, { bike: 1 }, "food")).toBe(true)
  })
})

describe("evaluateBasket", () => {
  it("says nothing about an empty basket", () => {
    expect(evaluateBasket(game, {})).toEqual([])
  })

  it("notices a basket with no essentials in it", () => {
    expect(evaluateBasket(game, { icecream: 1 })).toContain("noEssentials")
  })

  it("notices one purchase swallowing the budget", () => {
    expect(evaluateBasket(game, { bike: 1, water: 1 })).toContain("oneBigTreat")
  })

  it("notices money kept back", () => {
    expect(evaluateBasket(game, { water: 1 })).toContain("savedSome")
  })

  it("never returns more than three lessons at once", () => {
    expect(evaluateBasket(game, { water: 1, food: 1, pencil: 1 }).length).toBeLessThanOrEqual(3)
  })
})
