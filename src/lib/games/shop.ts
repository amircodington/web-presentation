import type { ShopGame } from "@/content/schema/activities"

export type Basket = Readonly<Record<string, number>>

/** A rule the basket demonstrated, in the order it should be shown. */
export type ShopRule = "allEssentials" | "noEssentials" | "spentItAll" | "savedSome" | "oneBigTreat"

const TREAT_SHARE = 0.5
const SAVED_SHARE = 0.2

export function basketTotal(game: ShopGame, basket: Basket): number {
  return game.products.reduce(
    (sum, product) => sum + product.price * (basket[product.id] ?? 0),
    0,
  )
}

export function budgetLeft(game: ShopGame, basket: Basket): number {
  return game.budget - basketTotal(game, basket)
}

/** Whether one more of this product still fits in the purse. */
export function canAfford(game: ShopGame, basket: Basket, productId: string): boolean {
  const product = game.products.find((candidate) => candidate.id === productId)
  if (!product) return false
  return product.price <= budgetLeft(game, basket)
}

/**
 * Reads the finished basket back as lessons.
 *
 * Pure, and deliberately not a score. A child who spent everything on ice cream
 * has not failed; they have demonstrated something the closing copy can name.
 * Naming it is the teaching — brief §20 is explicit that running out of money is
 * answered with "count again", never with an error.
 */
export function evaluateBasket(game: ShopGame, basket: Basket): ShopRule[] {
  const total = basketTotal(game, basket)
  if (total <= 0) return []

  const essentialIds = new Set(
    game.products.filter((product) => product.essential).map((product) => product.id),
  )
  const essentialSpend = game.products
    .filter((product) => essentialIds.has(product.id))
    .reduce((sum, product) => sum + product.price * (basket[product.id] ?? 0), 0)

  const biggest = Math.max(
    ...game.products.map((product) => product.price * (basket[product.id] ?? 0)),
  )

  const fired: ShopRule[] = []
  if (essentialSpend === 0) fired.push("noEssentials")
  else if (essentialSpend === total) fired.push("allEssentials")
  if (biggest / total >= TREAT_SHARE && essentialSpend < total) fired.push("oneBigTreat")
  if (budgetLeft(game, basket) >= game.budget * SAVED_SHARE) fired.push("savedSome")
  else if (budgetLeft(game, basket) === 0) fired.push("spentItAll")

  return fired.slice(0, 3)
}
