import { z } from "zod"
import { AudienceIdSchema, IsoDateSchema, MediaRefSchema, PriceSchema } from "./common"

/** A course in the catalogue. Inactive courses are excluded from every view. */
export const CourseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string().min(1)).default([]),
  targetAge: z.string().optional(),
  duration: z.string().optional(),
  priceRegular: PriceSchema.optional(),
  priceFestival: PriceSchema.optional(),
  registrationUrl: z.url().optional(),
  media: MediaRefSchema.optional(),
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
  headline: z.string().min(1),
  question: z.string().min(1),
  icon: z.string().min(1),
  needs: z.array(z.string().min(1)).min(1),
})

export const CoursesSchema = z.array(CourseSchema)
export const WorkshopsSchema = z.array(WorkshopSchema)
export const AudiencesSchema = z.array(AudienceSchema).min(1)

export type Course = z.infer<typeof CourseSchema>
export type Workshop = z.infer<typeof WorkshopSchema>
export type Audience = z.infer<typeof AudienceSchema>
