import { z } from "zod"

/**
 * Every string the on-screen collaboration form shows. Field labels differ per
 * track — a head teacher is asked for a school, an HR manager for a company —
 * so the block lives inside the track rather than beside it.
 *
 * The interest options are not listed here: they are `cards[].title`, so adding
 * a programme to the scene adds it to the form.
 */
const FormSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  nameLabel: z.string().min(1),
  namePlaceholder: z.string().min(1),
  roleLabel: z.string().min(1),
  organizationLabel: z.string().min(1),
  organizationPlaceholder: z.string().min(1),
  mobileLabel: z.string().min(1),
  mobilePlaceholder: z.string().min(1),
  cityLabel: z.string().min(1),
  cityPlaceholder: z.string().min(1),
  interestLabel: z.string().min(1),
  interestHint: z.string().min(1),
  notesLabel: z.string().min(1),
  notesPlaceholder: z.string().min(1),
  submitLabel: z.string().min(1),
  cancelLabel: z.string().min(1),
  successTitle: z.string().min(1),
  successBody: z.string().min(1),
  errors: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    organization: z.string().min(1),
    mobile: z.string().min(1),
    interests: z.string().min(1),
    submit: z.string().min(1),
  }),
})

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
  /** Label of the button that opens the form. */
  formCta: z.string().min(1),
  form: FormSchema,
})

export const CollaborationSchema = z.object({
  schools: TrackSchema,
  organizations: TrackSchema,
})

export type CollaborationTrack = z.infer<typeof TrackSchema>
export type CollaborationForm = z.infer<typeof FormSchema>
