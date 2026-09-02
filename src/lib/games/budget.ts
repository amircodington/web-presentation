import type { BudgetGame } from "@/content/schema/activities"

export type Allocations = Readonly<Record<string, number>>

/** The state of a household budget after a shock and the player's response. */
export interface BudgetState {
  /** Every line at its current amount, essentials already shocked. */
  lines: { id: string; label: string; amount: number; essential: boolean; floor: number }[]
  spend: number
  /** Income minus spend. Negative means the budget does not close. */
  buffer: number
  balanced: boolean
}

/**
 * Applies the shock to the essentials and the player's cuts to everything.
 *
 * The shock is a multiplier rather than a figure, because brief §58 wants the
 * content to survive: "essential costs have risen" stays true, and a printed
 * percentage is out of date before the festival ends.
 */
export function applyBudget(game: BudgetGame, cuts: Allocations): BudgetState {
  const lines = game.lines.map((line) => {
    const shocked = line.essential
      ? Math.round(line.amount * game.shock.essentialMultiplier)
      : line.amount
    const requested = cuts[line.id]
    // A cut can never take a line below what it actually needs to be, and a
    // player cannot "solve" the shock by pretending an essential got cheaper.
    const floor = line.essential ? Math.round(line.floor * game.shock.essentialMultiplier) : line.floor
    const amount = requested === undefined ? shocked : clamp(requested, floor, shocked)
    return { id: line.id, label: line.label, amount, essential: line.essential, floor }
  })

  const spend = lines.reduce((sum, line) => sum + line.amount, 0)
  return { lines, spend, buffer: game.income - spend, balanced: spend <= game.income }
}

/** What a line can be cut to, for the slider's range. */
export function rangeFor(game: BudgetGame, lineId: string): { min: number; max: number } {
  const state = applyBudget(game, {})
  const line = state.lines.find((candidate) => candidate.id === lineId)
  if (!line) return { min: 0, max: 0 }
  return { min: line.floor, max: line.amount }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
