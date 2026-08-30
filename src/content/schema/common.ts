import { z } from "zod"

/** Points at a video or image in `public/media`. */
export const MediaRefSchema = z.object({
  kind: z.enum(["image", "video"]),
  src: z.string().startsWith("/media/"),
  poster: z.string().startsWith("/media/").optional(),
  /** Required: the same string serves a screen reader and a failed-load fallback. */
  alt: z.string().min(1),
  /** Ken Burns pans toward this point. Portrait crops look wrong without it. */
  focalPoint: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).default([0.5, 0.5]),
})

export const AudienceIdSchema = z.enum([
  "student",
  "young-adult",
  "parent",
  "school",
  "organization",
  "government",
])

/** ISO Gregorian. Stored this way so sorting and "is it upcoming" stay trivial. */
export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")

/** Prices are integers in Toman. Never strings, never pre-formatted. */
export const PriceSchema = z.number().int().nonnegative()

export type MediaRef = z.infer<typeof MediaRefSchema>
export type AudienceId = z.infer<typeof AudienceIdSchema>
