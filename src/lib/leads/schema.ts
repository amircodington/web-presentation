import { z } from "zod"

/**
 * Iranian mobile number, normalised to Latin digits before it reaches here.
 * The kiosk keyboard and Persian keypads both produce Persian digits, so the
 * client normalises and this only has to police the shape.
 */
const MobileSchema = z.string().regex(/^09\d{9}$/, "expected 09XXXXXXXXX")

/**
 * Where a lead was captured.
 *
 * `kiosk` is a visitor filling in the collaboration form on the TV themselves.
 * `booth` is a member of staff logging someone they just spoke to, on a tablet.
 * The two collect different fields because they are different conversations —
 * a visitor never states their own follow-up status, and staff capture teenagers
 * and parents, who have no organisation to name.
 */
export const LeadSourceSchema = z.enum(["kiosk", "booth"])

const KioskLeadSchema = z.object({
  source: z.literal("kiosk"),
  track: z.enum(["schools", "organizations"]),
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(1).max(80),
  organization: z.string().trim().min(2).max(120),
  mobile: MobileSchema,
  city: z.string().trim().max(60).default(""),
  interests: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
  notes: z.string().trim().max(600).default(""),
})

const BoothLeadSchema = z.object({
  source: z.literal("booth"),
  audience: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(80),
  /** Blank is valid: a teenager or a parent has no organisation to give. */
  organization: z.string().trim().max(120).default(""),
  mobile: MobileSchema,
  interests: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
  status: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(600).default(""),
})

/**
 * What either client posts.
 *
 * Records written before the booth tablet existed have no `source`, so one is
 * supplied on the way in. Without it every lead already in the archive would
 * stop parsing the moment this shape changed, and `listLeads` skips what it
 * cannot parse — the whole archive would silently empty.
 */
export const LeadSubmissionSchema = z.preprocess(
  (value) =>
    value && typeof value === "object" && !("source" in value)
      ? { ...(value as object), source: "kiosk" }
      : value,
  z.discriminatedUnion("source", [KioskLeadSchema, BoothLeadSchema]),
)

/**
 * A submission as stored. `id` doubles as the filename and sorts
 * chronologically, so listing the archive is a directory read and a sort —
 * no index to keep consistent.
 */
const StoredFields = {
  id: z.string().min(1),
  submittedAt: z.string().datetime(),
  appVersion: z.string().min(1),
}

export const LeadRecordSchema = z.preprocess(
  (value) =>
    value && typeof value === "object" && !("source" in value)
      ? { ...(value as object), source: "kiosk" }
      : value,
  z.discriminatedUnion("source", [
    KioskLeadSchema.extend(StoredFields),
    BoothLeadSchema.extend(StoredFields),
  ]),
)

export type LeadSubmission = z.infer<typeof LeadSubmissionSchema>
export type LeadRecord = z.infer<typeof LeadRecordSchema>
export type BoothLeadRecord = Extract<LeadRecord, { source: "booth" }>

/** Reads a field that only one of the two shapes has. */
export function leadField(record: LeadRecord, key: string): string {
  const value = (record as unknown as Record<string, unknown>)[key]
  return typeof value === "string" ? value : ""
}
