import { z } from "zod"
import { AudienceIdSchema, ClockTimeSchema } from "./common"

/**
 * One run of the mini-activity programme: when it starts and which activity from
 * `activities.json` is on. Kept here rather than in the activity itself because the
 * catalogue is reusable and a running order belongs to a single event.
 */
const ScheduleSlotSchema = z.object({
  time: ClockTimeSchema,
  activityId: z.string().min(1),
})

/**
 * Everything that changes when the booth moves to a different event.
 *
 * Hours, running order, the audience the screen greets first, and which product it
 * leads with are all decisions the Wealth Club team makes per event, so none of
 * them may be reached by editing a component.
 */
export const EventSchema = z.object({
  name: z.string().min(1),
  venue: z.string().min(1),
  /** Short co-branding line: whose stand, at whose event. */
  contextTag: z.string().min(1),
  startTime: ClockTimeSchema,
  endTime: ClockTimeSchema,
  /** Product order in any public listing, and the override for one audience. */
  defaultProductOrder: z.array(z.string().min(1)).min(1),
  audienceProductOrder: z
    .partialRecord(AudienceIdSchema, z.array(z.string().min(1)).min(1))
    .default({}),
  schedule: z.array(ScheduleSlotSchema).min(1),
  /** Cadence line shown next to the running order. */
  cadence: z.string().min(1),
  nextSlotLabel: z.string().min(1),
})

export type EventConfig = z.infer<typeof EventSchema>
export type ScheduleSlot = z.infer<typeof ScheduleSlotSchema>
