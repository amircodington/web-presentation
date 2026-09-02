import { content } from "./load"
import type { AudienceGroup, AudienceId } from "./schema/common"
import type { Course, Workshop } from "./schema/catalogue"
import type { ProfileGame } from "./schema/activities"
import type { World, WorldExperience } from "./schema/worlds"

/** Courses that should appear anywhere in the UI. */
export function activeCourses(): readonly Course[] {
  return content.courses.filter((course) => course.active)
}

export function activeWorkshops(): readonly Workshop[] {
  return content.workshops.filter((workshop) => workshop.active)
}

export function coursesFor(audience: AudienceId): readonly Course[] {
  return orderProducts(
    activeCourses().filter((course) => course.audiences.includes(audience)),
    audience,
  )
}

/**
 * Sorts products into the order this event wants them shown.
 *
 * Which product leads is a positioning decision the Wealth Club team makes per
 * event and per audience — a recent-konkur visitor is led with +18 while everyone
 * else is led with the one-day workshop — so it comes from `event.json` rather
 * than from the order the catalogue happens to be written in. Anything the order
 * does not name keeps its catalogue position, after everything it does.
 */
export function orderProducts<T extends { id: string }>(
  products: readonly T[],
  audience?: AudienceId,
): readonly T[] {
  const order =
    (audience ? content.event.audienceProductOrder[audience] : undefined) ??
    content.event.defaultProductOrder
  const rank = (id: string) => {
    const index = order.indexOf(id)
    return index === -1 ? order.length : index
  }
  return [...products].sort((a, b) => rank(a.id) - rank(b.id))
}

/** The world a visitor chose at the gateway, by id. */
export function worldById(id: AudienceGroup): World | undefined {
  return content.worlds.worlds.find((world) => world.id === id)
}

/**
 * The experiences a world actually offers right now.
 *
 * Filtered rather than greyed out: an experience that is switched off must not
 * appear at all. A dead card on a kiosk is tapped repeatedly, and a visitor who
 * taps three of four cards and gets nothing walks away.
 */
export function activeExperiences(id: AudienceGroup): readonly WorldExperience[] {
  return worldById(id)?.experiences.filter((experience) => experience.active) ?? []
}

/**
 * Products a world's reveal draws from, in this event's order for that world.
 *
 * `answered` is the world qualifier's answer when there is one. It narrows both
 * the filter and the order — brief §44: a school-leaver is led with +18 and
 * everyone else is not, and that is one question rather than a fourth world.
 */
export function coursesForWorld(id: AudienceGroup, answered?: AudienceId): readonly Course[] {
  const world = worldById(id)
  if (!world) return []
  const wanted = answered && world.audiences.includes(answered) ? [answered] : world.audiences
  const matching = activeCourses().filter((course) =>
    course.audiences.some((audience) => wanted.includes(audience)),
  )
  return orderProducts(matching, wanted[0])
}

/**
 * Resolves the price to display, honouring the festival toggle.
 *
 * Returns `festival` only when the offer is switched on AND the product actually
 * has a festival price — so turning the offer off leaves no half-priced card
 * stranded on screen.
 */
export function priceFor(productId: string): { regular?: number; festival?: number } {
  const product =
    content.courses.find((course) => course.id === productId) ??
    content.workshops.find((workshop) => workshop.id === productId)
  if (!product) return {}

  const offerOn = content.festival.offerActive
  return {
    regular: product.priceRegular,
    festival: offerOn ? product.priceFestival : undefined,
  }
}

export function productById(id: string): Course | Workshop | undefined {
  return (
    content.courses.find((course) => course.id === id) ??
    content.workshops.find((workshop) => workshop.id === id)
  )
}

export function audienceById(id: AudienceId) {
  return content.audiences.find((audience) => audience.id === id)
}

/**
 * Fills a profile game's questions from its named source.
 *
 * A game that writes its own questions is returned untouched. The adults'
 * decision profile names `adult-scenarios` instead, so the team can rewrite the
 * bank without opening `activities.json` — brief §57.
 */
export function resolveProfile(game: ProfileGame): ProfileGame {
  if (game.questions) return game
  return { ...game, questions: content.adultScenarios.scenarios }
}
