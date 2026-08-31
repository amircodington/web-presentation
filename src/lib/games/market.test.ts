import { describe, expect, it } from "vitest"
import { candles, priceAfter, priceBounds } from "./market"
import type { MarketGame } from "@/content/schema/activities"

const game: MarketGame = {
  kind: "market",
  prompt: "p",
  startPrice: 100,
  unit: "u",
  rounds: [
    { news: "a", effect: "up", change: 20, explain: "e" },
    { news: "b", effect: "down", change: 30, explain: "e" },
    { news: "c", effect: "up", change: 10, explain: "e" },
  ],
}

describe("priceAfter", () => {
  it("starts at the opening price", () => {
    expect(priceAfter(game, 0)).toBe(100)
  })

  it("applies each resolved move in order", () => {
    expect(priceAfter(game, 1)).toBe(120)
    expect(priceAfter(game, 2)).toBe(90)
    expect(priceAfter(game, 3)).toBe(100)
  })
})

describe("candles", () => {
  it("draws nothing before the first answer", () => {
    expect(candles(game, 0)).toEqual([])
  })

  it("opens each candle where the previous one closed", () => {
    const drawn = candles(game, 3)
    expect(drawn).toHaveLength(3)
    expect(drawn[1]).toEqual({ index: 1, open: 120, close: 90, direction: "down" })
    expect(drawn[2]?.open).toBe(90)
  })

  it("never draws past the last round", () => {
    expect(candles(game, 99)).toHaveLength(3)
  })
})

describe("priceBounds", () => {
  it("covers every price the game can reach, with headroom", () => {
    const { min, max } = priceBounds(game)
    expect(min).toBeLessThan(90)
    expect(max).toBeGreaterThan(120)
  })

  it("does not depend on how far the game has been played", () => {
    expect(priceBounds(game)).toEqual(priceBounds(game))
  })
})
