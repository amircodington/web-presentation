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

/**
 * Every icon the kiosk can draw.
 *
 * Content names an icon; `components/ui/Icon.tsx` owns the geometry. Emoji were
 * replaced by this set because emoji are rendered by the host font at whatever
 * weight and colour the platform chooses — on a two-metre screen that reads as
 * clip art pasted onto the design, and it cannot be tinted to match a state.
 *
 * The enum is the contract: naming an icon that does not exist fails content
 * validation at build time rather than rendering an empty square at the booth.
 */
export const IconNameSchema = z.enum([
  "student",
  "parent",
  "konkur",
  "school",
  "organization",
  "gauge",
  "coins",
  "chart",
  "flag",
  "basket",
  "spend",
  "save",
  "gold",
  "market",
  "business",
  "education",
  "cash",
  "clock",
  "play",
  "qr",
  "globe",
  "telegram",
  "chat",
  "gift",
  "check",
  "cross",
  "up",
  "down",
  "spark",
  "map",
])

export const AudienceIdSchema = z.enum([
  "student",
  "recent-konkur",
  "young-adult",
  "parent",
  "school",
  "organization",
  "government",
])

/** ISO Gregorian. Stored this way so sorting and "is it upcoming" stay trivial. */
export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")

/** Wall-clock `HH:MM` on a 24-hour dial. The booth day never crosses midnight. */
export const ClockTimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "expected HH:MM")

/** Prices are integers in Toman. Never strings, never pre-formatted. */
export const PriceSchema = z.number().int().nonnegative()

export type MediaRef = z.infer<typeof MediaRefSchema>
export type IconName = z.infer<typeof IconNameSchema>
export type AudienceId = z.infer<typeof AudienceIdSchema>
