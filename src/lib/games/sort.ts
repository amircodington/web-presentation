import type { SortGame } from "@/content/schema/activities"

/** The verdict reserved for items that are genuinely either, depending. */
export const DEPENDS = "depends"

export type SortVerdict = "right" | "wrong" | "depends"

/**
 * Judges one drop.
 *
 * An item marked `depends` is never wrong. Brief §18's whole lesson is that a
 * money decision is not always yes or no, and a game that tells a child their
 * defensible answer is incorrect teaches the opposite of that.
 */
export function judgeDrop(game: SortGame, itemId: string, binId: string): SortVerdict {
  const item = game.items.find((candidate) => candidate.id === itemId)
  if (!item) return "wrong"
  if (item.verdict === DEPENDS) return "depends"
  return item.verdict === binId ? "right" : "wrong"
}

/** Everything the round produced, for the closing screen. */
export interface SortTally {
  right: number
  depends: number
  wrong: number
  total: number
}

export function tallySort(
  game: SortGame,
  placements: Readonly<Record<string, string>>,
): SortTally {
  const tally: SortTally = { right: 0, depends: 0, wrong: 0, total: game.items.length }
  for (const [itemId, binId] of Object.entries(placements)) {
    const verdict = judgeDrop(game, itemId, binId)
    if (verdict === "right") tally.right += 1
    else if (verdict === "depends") tally.depends += 1
    else tally.wrong += 1
  }
  return tally
}
