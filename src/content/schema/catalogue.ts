import { z } from "zod"
import {
  AudienceIdSchema,
  IconNameSchema,
  IsoDateSchema,
  MediaRefSchema,
  PriceSchema,
} from "./common"

/** One themed block of a course syllabus. */
export const CurriculumBlockSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

/** Practical details a visitor asks about at the booth: when, where, how. */
export const LogisticsSchema = z.object({
  startDate: z.string().optional(),
  weekday: z.string().optional(),
  time: z.string().optional(),
  deliveryModes: z.array(z.string().min(1)).default([]),
  location: z.string().optional(),
  capacityDisplay: z.string().optional(),
  instructors: z.string().optional(),
})

/** A course in the catalogue. Inactive courses are excluded from every view. */
export const CourseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Campaign line from the poster, when the course is marketed under one. */
  campaignTitle: z.string().optional(),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string().min(1)).default([]),
  targetAge: z.string().optional(),
  duration: z.string().optional(),
  priceRegular: PriceSchema.optional(),
  priceFestival: PriceSchema.optional(),
  registrationUrl: z.url().optional(),
  /** Landscape image for cards. Anything that crops to a wide strip belongs here. */
  media: MediaRefSchema.optional(),
  /**
   * The printed campaign poster, which is portrait.
   *
   * Kept apart from `media` because the two crop in opposite directions: a poster
   * squeezed into a card's wide strip shows a band of background and none of its
   * artwork. Only the detail scene, which has a full-height column to give it, ever
   * shows this.
   */
  campaignPoster: MediaRefSchema.optional(),
  curriculum: z.array(CurriculumBlockSchema).default([]),
  logistics: LogisticsSchema.optional(),
  /** Key into qr.json. Validated against that file by the loader. */
  qrKey: z.string().optional(),
  audiences: z.array(AudienceIdSchema).default([]),
  active: z.boolean(),
})

/** A dated workshop session. `capacity` drives the "almost full" badge. */
export const WorkshopSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().optional(),
  date: IsoDateSchema.optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.string().optional(),
  teacher: z.string().optional(),
  targetAge: z.string().optional(),
  priceRegular: PriceSchema.optional(),
  priceFestival: PriceSchema.optional(),
  capacity: z.number().int().positive().optional(),
  registrationUrl: z.url().optional(),
  active: z.boolean(),
})

export const AudienceSchema = z.object({
  id: AudienceIdSchema,
  label: z.string().min(1),
  /**
   * How the visitor names themselves — "I'm a student", not "Student".
   * The home screen asks the visitor to point at themselves, and a first-person
   * card is answered faster than a category label.
   */
  selfLabel: z.string().min(1),
  headline: z.string().min(1),
  question: z.string().min(1),
  icon: IconNameSchema,
  /** Photograph from a real Wealth Club session, shown on the home card. */
  media: MediaRefSchema.optional(),
  /**
   * A second question this audience has to answer before a recommendation means
   * anything. A parent picking "my child" has told us nothing until they say
   * which year the child is in — the answer routes them to a different product.
   */
  followUp: z
    .object({
      options: z
        .array(
          z.object({
            label: z.string().min(1),
            detail: z.string().min(1),
            /** Re-files the visitor as this audience, changing what leads. */
            audience: AudienceIdSchema.optional(),
          }),
        )
        .min(2),
    })
    .optional(),
  needs: z.array(z.string().min(1)).min(1),
})

export const CoursesSchema = z.array(CourseSchema)
export const WorkshopsSchema = z.array(WorkshopSchema)
export const AudiencesSchema = z.array(AudienceSchema).min(1)

export type Course = z.infer<typeof CourseSchema>
export type Workshop = z.infer<typeof WorkshopSchema>
export type Audience = z.infer<typeof AudienceSchema>
