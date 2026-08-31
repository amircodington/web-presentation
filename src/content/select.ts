import { content } from "./load"
import type { AudienceId } from "./schema/common"
import type { Audience, Course, Workshop } from "./schema/catalogue"

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

/** Every audience the home screen offers, in the order this event wants them. */
export function prioritisedAudiences(): { primary: Audience[]; secondary: Audience[] } {
  const { audiencePriority, secondaryAudiences } = content.event
  const inOrder = audiencePriority
    .map((id) => content.audiences.find((audience) => audience.id === id))
    .filter((audience): audience is Audience => audience !== undefined)

  return {
    primary: inOrder.filter((audience) => !secondaryAudiences.includes(audience.id)),
    secondary: inOrder.filter((audience) => secondaryAudiences.includes(audience.id)),
  }
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
