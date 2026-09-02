import { describe, expect, it } from "vitest"
import { runStall, stallLesson } from "./stall"
import type { StallGame } from "@/content/schema/activities"

const game = {
  kind: "stall",
  prompt: "",
  currency: "سکه",
  products: [
    { id: "juice", label: "آبمیوه", icon: "juice", cost: 4, prices: [3, 6, 10, 16] },
    { id: "cookie", label: "کوکی", icon: "cookie", cost: 2, prices: [2, 5, 9, 14] },
    { id: "painting", label: "نقاشی", icon: "painting", cost: 1, prices: [2, 5, 8, 12] },
  ],
  customers: [
    { name: "الف", willingToPay: 5 },
    { name: "ب", willingToPay: 8 },
    { name: "پ", willingToPay: 12 },
    { name: "ت", willingToPay: 20 },
  ],
  reactions: { buys: "", tooExpensive: "", bargain: "" },
  feedback: {},
} as StallGame

describe("runStall", () => {
  it("sells to everyone who will pay at least the asking price", () => {
    const result = runStall(game, "juice", 6)
    expect(result.sold).toBe(3)
    expect(result.revenue).toBe(18)
    expect(result.profit).toBe(18 - 3 * 4)
  })

  it("sells nothing above what anyone will pay", () => {
    expect(runStall(game, "juice", 100).sold).toBe(0)
  })

  it("marks the customer who would gladly have paid much more, but not the one paying their limit", () => {
    const result = runStall(game, "juice", 5)
    expect(result.sales.find((sale) => sale.name === "ت")?.bargain).toBe(true)
    expect(result.sales.find((sale) => sale.name === "الف")?.bargain).toBe(false)
  })

  it("can lose money, which is the whole point of naming a cost", () => {
    expect(runStall(game, "juice", 3).profit).toBeLessThan(0)
  })
})

describe("stallLesson", () => {
  it("names selling at or below what it costs to make", () => {
    expect(stallLesson(game, "juice", 3)).toBe("belowCost")
  })

  it("names a price nobody will pay", () => {
    expect(stallLesson(game, "juice", 100)).toBe("tooExpensive")
  })

  it("names a price so low that everyone bought and more was available", () => {
    expect(stallLesson(game, "cookie", 5)).toBe("couldCharge")
  })

  it("names a price that traded volume against margin sensibly", () => {
    expect(stallLesson(game, "juice", 10)).toBe("goodPrice")
  })
})
