import type { AllocationGame } from "@/content/schema/activities"

export type Allocation = Readonly<Record<string, number>>

/** A rule that fired, in the order it should be shown. */
export type AllocationRule =
  | "allCash"
  | "concentrated"
  | "highRisk"
  | "noGrowth"
  | "noEducation"
  | "balanced"

const CONCENTRATION_LIMIT = 0.6
const HIGH_RISK_LIMIT = 0.6
const BALANCED_SPREAD_LIMIT = 0.5
const BALANCED_MIN_BUCKETS = 3

/**
 * Evaluates a completed allocation and returns the lessons it demonstrates.
 *
 * Pure: allocation in, rule ids out. The teaching copy lives in the content file
 * keyed by rule id, so the wording can be edited without touching this logic and
 * the logic can be tested without rendering anything.
 *
 * At most three rules are returned. A visitor at a booth reads one screen, and a
 * wall of six criticisms teaches less than two pointed ones.
 */
export function evaluateAllocation(game: AllocationGame, allocation: Allocation): AllocationRule[] {
  const total = Object.values(allocation).reduce((sum, n) => sum + n, 0)
  if (total <= 0) return []

  const share = (id: string) => (allocation[id] ?? 0) / total
  const used = game.options.filter((option) => (allocation[option.id] ?? 0) > 0)
  const largest = Math.max(...game.options.map((option) => share(option.id)))

  const growthShare = game.options
    .filter((option) => option.growth)
    .reduce((sum, option) => sum + share(option.id), 0)
  const highRiskShare = game.options
    .filter((option) => option.risk === "high")
    .reduce((sum, option) => sum + share(option.id), 0)
  const hasEducation = (allocation.education ?? 0) > 0

  const fired: AllocationRule[] = []

  if (growthShare === 0) fired.push("allCash")
  else {
    if (largest >= CONCENTRATION_LIMIT) fired.push("concentrated")
    if (highRiskShare >= HIGH_RISK_LIMIT) fired.push("highRisk")
    if (growthShare < 0.2) fired.push("noGrowth")
    if (!hasEducation && "education" in gameOptionIds(game)) fired.push("noEducation")
  }

  if (
    fired.length === 0 &&
    used.length >= BALANCED_MIN_BUCKETS &&
    largest < BALANCED_SPREAD_LIMIT
  ) {
    fired.push("balanced")
  }

  return fired.slice(0, 3)
}

function gameOptionIds(game: AllocationGame): Record<string, true> {
  return Object.fromEntries(game.options.map((option) => [option.id, true as const]))
}

/** Percentage split, for the result chart. Rounds to whole percents. */
export function allocationShares(
  game: AllocationGame,
  allocation: Allocation,
): { id: string; label: string; icon: string; percent: number }[] {
  const total = Object.values(allocation).reduce((sum, n) => sum + n, 0)
  if (total <= 0) return []
  return game.options
    .map((option) => ({
      id: option.id,
      label: option.label,
      icon: option.icon,
      percent: Math.round(((allocation[option.id] ?? 0) / total) * 100),
    }))
    .filter((entry) => entry.percent > 0)
    .sort((a, b) => b.percent - a.percent)
}

/** Tokens still to be placed. The game is complete when this reaches zero. */
export function tokensLeft(game: AllocationGame, allocation: Allocation): number {
  const placed = Object.values(allocation).reduce((sum, n) => sum + n, 0)
  return Math.max(0, game.tokens - placed)
}
