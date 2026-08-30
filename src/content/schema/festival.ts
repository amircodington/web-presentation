import { z } from "zod"
import { IsoDateSchema } from "./common"

export const FestivalSchema = z.object({
  name: z.string().min(1),
  offerActive: z.boolean(),
  offerTitle: z.string().min(1),
  offerDescription: z.string().min(1),
  validUntil: IsoDateSchema.optional(),
})

export const ContactSchema = z.object({
  phone: z.string().min(1),
  website: z.string().min(1),
  instagram: z.string().optional(),
  bale: z.string().optional(),
})

/**
 * Every QR destination, keyed by purpose. URLs are stored complete, including any
 * campaign parameters — assembling them in a component produces a mix of tagged
 * and untagged traffic with no way to tell which screen produced it.
 */
export const QrSchema = z.record(z.string().min(1), z.url())

export type Festival = z.infer<typeof FestivalSchema>
export type Contact = z.infer<typeof ContactSchema>
