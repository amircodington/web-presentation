import type { MascotName, MascotMood } from "@/components/ui/Mascot"
import type { IconName } from "@/content/schema/common"

/**
 * Which character stands for which place money can go.
 *
 * Content names an option by its icon, so the cast is derived rather than stored:
 * adding an allocation option to `activities.json` gets a character without a
 * matching content edit, and an option whose icon has no character falls back to
 * the coin rather than rendering nothing.
 */
export const MASCOT_BY_ICON: Partial<Record<IconName, MascotName>> = {
  spend: "bag",
  cash: "piggy",
  save: "piggy",
  gold: "ingot",
  market: "rocket",
  business: "shop",
  education: "book",
  basket: "bag",
  chart: "rocket",
  coins: "coin",
}

export function castFor(icon: IconName): MascotName {
  return MASCOT_BY_ICON[icon] ?? "coin"
}

/** Fill levels at which a character's expression changes. */
const DELIGHTED_AT = 1
const THRILLED_AT = 3
const OVERLOADED_AT = 5

/**
 * How a character feels about the pile it has been given.
 *
 * This is the game's first teaching move and it happens before a word is read: a
 * character keeps looking better as it is fed until the pile becomes a
 * concentration, at which point it goes dizzy. A child who has made one character
 * dizzy has already met diversification, and the written feedback then names what
 * they saw rather than introducing it.
 */
export function moodFor(count: number, isTarget: boolean): MascotMood {
  if (isTarget) return "wow"
  if (count >= OVERLOADED_AT) return "dizzy"
  if (count >= THRILLED_AT) return "wow"
  if (count >= DELIGHTED_AT) return "happy"
  return "idle"
}
