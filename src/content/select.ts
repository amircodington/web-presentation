import { content } from "./load"
import type { AudienceId } from "./schema/common"
import type { Course, Workshop } from "./schema/catalogue"

/** Courses that should appear anywhere in the UI. */
export function activeCourses(): readonly Course[] {
  return content.courses.filter((course) => course.active)
}

export function activeWorkshops(): readonly Workshop[] {
  return content.workshops.filter((workshop) => workshop.active)
}

export function coursesFor(audience: AudienceId): readonly Course[] {
  return activeCourses().filter((course) => course.audiences.includes(audience))
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
