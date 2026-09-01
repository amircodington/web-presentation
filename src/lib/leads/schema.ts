import { z } from "zod"

/**
 * Iranian mobile number, normalised to Latin digits before it reaches here.
 * The kiosk keyboard and Persian keypads both produce Persian digits, so the
 * client normalises and this only has to police the shape.
 */
const MobileSchema = z.string().regex(/^09\d{9}$/, "expected 09XXXXXXXXX")

/** What the kiosk posts. Everything is trimmed and length-capped client-side too. */
export const LeadSubmissionSchema = z.object({
  track: z.enum(["schools", "organizations"]),
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(1).max(80),
  organization: z.string().trim().min(2).max(120),
  mobile: MobileSchema,
  city: z.string().trim().max(60).default(""),
  interests: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
  notes: z.string().trim().max(600).default(""),
})

/**
 * A submission as stored. `id` doubles as the filename and sorts
 * chronologically, so listing the archive is a directory read and a sort —
 * no index to keep consistent.
 */
export const LeadRecordSchema = LeadSubmissionSchema.extend({
  id: z.string().min(1),
  submittedAt: z.string().datetime(),
  appVersion: z.string().min(1),
})

export type LeadSubmission = z.infer<typeof LeadSubmissionSchema>
export type LeadRecord = z.infer<typeof LeadRecordSchema>
