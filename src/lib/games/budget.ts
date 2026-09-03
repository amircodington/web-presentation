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

/** A finding about what the player actually did to the budget. */
export type BudgetRule =
  | "unbalanced"
  | "untouched"
  | "cutEducation"
  | "strippedDiscretionary"
  | "squeezedEssentials"
  | "noBuffer"
  | "keptBuffer"

/** The player's own numbers, for a result that talks about them and not in general. */
export interface BudgetAnalysis {
  state: BudgetState
  /** How much the shock added to the essentials. */
  shockCost: number
  /** How much the player took out of the budget, across every line. */
  cut: number
  /** Non-essential lines taken all the way to their floor. */
  emptied: string[]
  rules: BudgetRule[]
}

const BUFFER_HEALTHY_SHARE = 0.05

/**
 * Reads back the budget the player built, not the answer they ticked.
 *
 * The game asked a visitor to re-cut a household budget under a shock and then
 * threw the result away, scoring only the multiple-choice question that followed —
 * so two people who had done opposite things to the same budget were told the same
 * thing. Brief §9.3 asks for an analytical result, and the only material this game
 * has for one is the budget itself.
 *
 * Pure: game and cuts in, findings out. Copy lives in the content file keyed by
 * rule id, exactly as the allocation game's does.
 */
export function analyseBudget(game: BudgetGame, cuts: Allocations): BudgetAnalysis {
  const state = applyBudget(game, cuts)
  const shocked = applyBudget(game, {})

  const shockCost = shocked.spend - game.lines.reduce((sum, line) => sum + line.amount, 0)
  const cut = shocked.spend - state.spend

  const discretionary = state.lines.filter((line) => !line.essential)
  const emptied = discretionary
    .filter((line) => line.amount <= line.floor)
    .map((line) => line.label)

  const education = state.lines.find((line) => line.id === "education")
  const essentials = state.lines.filter((line) => line.essential)
  const squeezed = essentials.filter((line) => line.amount <= line.floor).length

  // Whether the budget closes, and on what margin, always leads: it is the one
  // thing the player was asked to do. It is also why it is not subject to the cap
  // below — an earlier version appended it last and the cap dropped it, so a
  // budget that balanced was told only what had been cut to make it balance.
  const balance: BudgetRule = !state.balanced
    ? "unbalanced"
    : state.buffer >= game.income * BUFFER_HEALTHY_SHARE
      ? "keptBuffer"
      : "noBuffer"

  const observations: BudgetRule[] = []
  if (cut === 0) observations.push("untouched")
  if (education && education.amount === 0) observations.push("cutEducation")
  if (discretionary.length > 0 && emptied.length === discretionary.length) {
    observations.push("strippedDiscretionary")
  }
  if (squeezed >= 2) observations.push("squeezedEssentials")

  // A visitor at a booth reads one screen. Three findings is already generous.
  return { state, shockCost, cut, emptied, rules: [balance, ...observations.slice(0, 2)] }
}
