import type { MarketGame } from "@/content/schema/activities"

/** One headline's move, as a candle: where the price opened and where it closed. */
export interface Candle {
  index: number
  open: number
  close: number
  direction: "up" | "down"
}

/** The price after `roundsPlayed` headlines have resolved. */
export function priceAfter(game: MarketGame, roundsPlayed: number): number {
  return game.rounds
    .slice(0, roundsPlayed)
    .reduce((price, round) => price + (round.effect === "up" ? round.change : -round.change), game.startPrice)
}

/** Candles for the headlines resolved so far. Empty before the first answer. */
export function candles(game: MarketGame, roundsPlayed: number): Candle[] {
  const drawn: Candle[] = []
  for (let index = 0; index < Math.min(roundsPlayed, game.rounds.length); index += 1) {
    const open = priceAfter(game, index)
    const close = priceAfter(game, index + 1)
    drawn.push({ index, open, close, direction: close >= open ? "up" : "down" })
  }
  return drawn
}

/**
 * The value range the chart is drawn against.
 *
 * Computed over the whole game rather than over the candles drawn so far, so the
 * axis does not rescale between rounds — a chart whose gridlines jump every time
 * a candle lands makes the moves impossible to compare, which is the one thing
 * this game is teaching.
 */
export function priceBounds(game: MarketGame): { min: number; max: number } {
  const prices = game.rounds.map((_, index) => priceAfter(game, index + 1))
  prices.push(game.startPrice)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const padding = Math.max(4, Math.round((max - min) * 0.18))
  return { min: min - padding, max: max + padding }
}
