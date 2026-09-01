import { z } from "zod"

/**
 * Copy and options for the booth staff's capture tablet.
 *
 * Every label a member of staff reads lives here rather than in the component,
 * for the same reason the kiosk's does: the running order, the product names and
 * the follow-up vocabulary all change between festivals, and none of that should
 * need a rebuild by a developer who is not at the stand.
 */
const OptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

export const BoothAudienceOptionSchema = OptionSchema.extend({
  /**
   * Whether picking this audience makes the organisation field required. A
   * school lead without a school name is not a lead anybody can follow up.
   */
  needsOrganization: z.boolean(),
})

export const BoothStatusOptionSchema = OptionSchema.extend({
  tone: z.enum(["positive", "money", "joy", "neutral"]),
})

export const BoothSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  audienceLabel: z.string().min(1),
  contactLabel: z.string().min(1),
  interestLabel: z.string().min(1),
  interestHint: z.string().min(1),
  statusLabel: z.string().min(1),
  nameLabel: z.string().min(1),
  namePlaceholder: z.string().min(1),
  mobileLabel: z.string().min(1),
  mobilePlaceholder: z.string().min(1),
  organizationLabel: z.string().min(1),
  organizationPlaceholder: z.string().min(1),
  notesLabel: z.string().min(1),
  notesPlaceholder: z.string().min(1),
  saveLabel: z.string().min(1),
  savingLabel: z.string().min(1),
  todayLabel: z.string().min(1),
  exportTitle: z.string().min(1),
  exportHint: z.string().min(1),
  csvLabel: z.string().min(1),
  jsonLabel: z.string().min(1),
  pdfLabel: z.string().min(1),
  recentLabel: z.string().min(1),
  duplicateWarning: z.string().min(1),
  queuedLabel: z.string().min(1),
  retryLabel: z.string().min(1),
  audiences: z.array(BoothAudienceOptionSchema).min(2),
  interests: z.array(OptionSchema).min(2),
  statuses: z.array(BoothStatusOptionSchema).min(2),
  errors: z.object({
    audience: z.string().min(1),
    name: z.string().min(1),
    mobile: z.string().min(1),
    organization: z.string().min(1),
    interests: z.string().min(1),
    status: z.string().min(1),
    network: z.string().min(1),
  }),
  savedMessage: z.string().min(1),
})

export type Booth = z.infer<typeof BoothSchema>
export type BoothAudienceOption = z.infer<typeof BoothAudienceOptionSchema>
export type BoothStatusOption = z.infer<typeof BoothStatusOptionSchema>
