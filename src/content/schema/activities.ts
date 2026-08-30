import { z } from "zod"

const ActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  durationMin: z.number().int().positive(),
  icon: z.string().min(1),
  hook: z.string().min(1),
  mechanic: z.string().min(1),
  learning: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1),
})

/**
 * The live mini-workshops run at the booth. The kiosk shows what is coming next so
 * the screen advertises the stand's own programme rather than competing with it.
 */
export const ActivitiesSchema = z.object({
  title: z.string().min(1),
  eventHours: z.string().min(1),
  cadence: z.string().min(1),
  nextSlotLabel: z.string().min(1),
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  activities: z.array(ActivitySchema).min(1),
})

export type Activity = z.infer<typeof ActivitySchema>
