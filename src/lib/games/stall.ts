import type { StallGame } from "@/content/schema/activities"

/** How one customer reacted, and what it earned. */
export interface Sale {
  name: string
  bought: boolean
  /** True when the customer would happily have paid a good deal more. */
  bargain: boolean
}

export interface StallResult {
  sales: Sale[]
  sold: number
  revenue: number
  /** Revenue minus what it cost to make everything sold. */
  profit: number
}

/** A customer who would have paid this much more considers it a bargain. */
const BARGAIN_MARGIN = 1.4

/**
 * Runs the queue past a chosen product at a chosen price.
 *
 * The model is one line long on purpose — a customer buys when the price is
 * within what they will pay — because the lesson brief §21 is after is that a
 * price is a trade, not an answer. Charge little and everyone buys for almost
 * nothing; charge a lot and one person buys. A child sees both by playing twice.
 */
export function runStall(game: StallGame, productId: string, price: number): StallResult {
  const product = game.products.find((candidate) => candidate.id === productId)
  if (!product) return { sales: [], sold: 0, revenue: 0, profit: 0 }

  const sales = game.customers.map((customer) => ({
    name: customer.name,
    bought: price <= customer.willingToPay,
    bargain: price <= customer.willingToPay / BARGAIN_MARGIN,
  }))

  const sold = sales.filter((sale) => sale.bought).length
  const revenue = sold * price
  return { sales, sold, revenue, profit: revenue - sold * product.cost }
}

/** Which lesson the round earned. One, not a list — this is the youngest world. */
export function stallLesson(game: StallGame, productId: string, price: number): string {
  const product = game.products.find((candidate) => candidate.id === productId)
  if (!product) return "noSale"
  const result = runStall(game, productId, price)

  if (result.sold === 0) return "tooExpensive"
  if (price <= product.cost) return "belowCost"
  if (result.sold === game.customers.length && price < Math.max(...product.prices)) {
    return "couldCharge"
  }
  return "goodPrice"
}
