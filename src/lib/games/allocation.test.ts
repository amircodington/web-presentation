import { describe, expect, it } from "vitest"
import { content } from "@/content/load"
import type { AllocationGame } from "@/content/schema/activities"
import { allocationShares, evaluateAllocation, tokensLeft, type Allocation } from "./allocation"

function gameFor(id: string): AllocationGame {
  const activity = content.activities.activities.find((a) => a.id === id)
  if (activity?.game?.kind !== "allocation") throw new Error(`${id} is not an allocation game`)
  return activity.game
}

const challenge = gameFor("challenge-100m")

describe("evaluateAllocation", () => {
  it("returns nothing for an empty allocation", () => {
    expect(evaluateAllocation(challenge, {})).toEqual([])
  })

  it("flags an all-cash allocation", () => {
    expect(evaluateAllocation(challenge, { save: 6, spend: 4 })).toContain("allCash")
  })

  it("flags concentration when one option dominates", () => {
    expect(evaluateAllocation(challenge, { gold: 8, save: 2 })).toContain("concentrated")
  })

  it("flags a high-risk-heavy allocation", () => {
    expect(evaluateAllocation(challenge, { market: 4, business: 4, save: 2 })).toContain("highRisk")
  })

  it("flags a missing education allocation", () => {
    expect(evaluateAllocation(challenge, { gold: 3, market: 3, save: 4 })).toContain("noEducation")
  })

  it("praises a spread allocation with room to grow", () => {
    expect(evaluateAllocation(challenge, { gold: 3, market: 2, education: 3, save: 2 })).toEqual([
      "balanced",
    ])
  })

  it("never returns more than three rules", () => {
    for (const option of challenge.options) {
      const rules = evaluateAllocation(challenge, { [option.id]: challenge.tokens })
      expect(rules.length).toBeLessThanOrEqual(3)
    }
  })

  it("only ever returns rules the content has copy for", () => {
    const combos: Allocation[] = [
      { spend: 10 },
      { save: 10 },
      { gold: 10 },
      { market: 10 },
      { business: 10 },
      { education: 10 },
      { save: 5, gold: 5 },
      { gold: 3, market: 3, education: 4 },
      { spend: 2, save: 2, gold: 2, market: 2, education: 2 },
    ]
    for (const combo of combos) {
      for (const rule of evaluateAllocation(challenge, combo)) {
        expect(challenge.feedback[rule], `${rule} for ${JSON.stringify(combo)}`).toBeDefined()
      }
    }
  })

  it("always says something about a completed allocation", () => {
    // A visitor who finishes the game must never see an empty result panel.
    const combos: Allocation[] = [
      { spend: 10 },
      { education: 10 },
      { gold: 4, market: 3, education: 3 },
      { save: 2, gold: 2, market: 2, business: 2, education: 2 },
    ]
    for (const combo of combos) {
      expect(evaluateAllocation(challenge, combo).length, JSON.stringify(combo)).toBeGreaterThan(0)
    }
  })
})

describe("allocationShares", () => {
  it("returns whole percents that cover the allocation", () => {
    const shares = allocationShares(challenge, { gold: 5, education: 5 })
    expect(shares.map((s) => s.percent)).toEqual([50, 50])
  })

  it("omits untouched options and sorts by size", () => {
    const shares = allocationShares(challenge, { gold: 2, education: 6, save: 2 })
    expect(shares[0]!.id).toBe("education")
    expect(shares.some((s) => s.id === "market")).toBe(false)
  })
})

describe("tokensLeft", () => {
  it("counts down as tokens are placed", () => {
    expect(tokensLeft(challenge, {})).toBe(challenge.tokens)
    expect(tokensLeft(challenge, { gold: 4 })).toBe(challenge.tokens - 4)
    expect(tokensLeft(challenge, { gold: challenge.tokens })).toBe(0)
  })

  it("never goes negative", () => {
    expect(tokensLeft(challenge, { gold: 99 })).toBe(0)
  })
})

/**
 * Every way `tokens` can be split across `options` — including the splits nobody
 * thinks to write down by hand, which is where a gap between two thresholds hides.
 */
function everyAllocation(optionIds: readonly string[], tokens: number): Allocation[] {
  if (optionIds.length === 0) return tokens === 0 ? [{}] : []
  const [head, ...rest] = optionIds as [string, ...string[]]
  const all: Allocation[] = []
  for (let count = 0; count <= tokens; count += 1) {
    for (const tail of everyAllocation(rest, tokens - count)) {
      all.push(count > 0 ? { [head]: count, ...tail } : tail)
    }
  }
  return all
}

describe("every allocation game in content", () => {
  it("says something about every possible way the pot can be split", () => {
    // The result panel renders one card per rule. A split that fires no rule shows
    // a chart and nothing else, which reads as the game having broken.
    for (const activity of content.activities.activities) {
      if (activity.game?.kind !== "allocation") continue
      const game = activity.game
      const splits = everyAllocation(
        game.options.map((option) => option.id),
        game.tokens,
      )
      expect(splits.length).toBeGreaterThan(0)
      for (const split of splits) {
        const rules = evaluateAllocation(game, split)
        expect(rules.length, `${activity.id}: ${JSON.stringify(split)}`).toBeGreaterThan(0)
        for (const rule of rules) {
          expect(game.feedback[rule], `${activity.id}: ${rule}`).toBeDefined()
        }
      }
    }
  })

  it("has feedback copy for every rule it can produce", () => {
    for (const activity of content.activities.activities) {
      if (activity.game?.kind !== "allocation") continue
      const game = activity.game
      const combos: Allocation[] = [
        ...game.options.map((o) => ({ [o.id]: game.tokens })),
        Object.fromEntries(game.options.map((o) => [o.id, 2])),
      ]
      for (const combo of combos) {
        for (const rule of evaluateAllocation(game, combo)) {
          expect(game.feedback[rule], `${activity.id}: ${rule}`).toBeDefined()
        }
      }
    }
  })
})
