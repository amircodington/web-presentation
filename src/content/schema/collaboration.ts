import { z } from "zod"

const TrackSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  audience: z.array(z.string().min(1)).min(1),
  cards: z
    .array(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .min(1),
  /**
   * B2B and B2G pricing is always quoted, never listed. Showing a per-student
   * figure on a public screen undercuts the negotiation the booth exists to start.
   */
  pricePolicy: z.string().min(1),
  qrKey: z.string().min(1),
  cta: z.string().min(1),
})

export const CollaborationSchema = z.object({
  schools: TrackSchema,
  organizations: TrackSchema,
})

export type CollaborationTrack = z.infer<typeof TrackSchema>
