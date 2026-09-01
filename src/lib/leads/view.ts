import type { LeadRecord } from "./schema"

/**
 * One flat row per lead, whatever shape it was captured in.
 *
 * The archive, the CSV and the PDF all need the same answer to "what does this
 * lead say", and the two capture shapes do not overlap: a kiosk lead has a track
 * and a role, a booth lead has an audience and a follow-up status. Projecting
 * once here keeps that difference in a single place — the alternative is three
 * copies of the same conditional, which is how a column ends up blank in the CSV
 * and populated in the PDF.
 */
export interface LeadRow {
  id: string
  /** ISO date and 24h time, both in Tehran, where the booth actually is. */
  date: string
  time: string
  sourceLabel: string
  audience: string
  name: string
  role: string
  organization: string
  mobile: string
  city: string
  interests: string
  status: string
  notes: string
}

const TRACK_LABEL: Record<string, string> = {
  schools: "مدرسه",
  organizations: "سازمان",
}

const SOURCE_LABEL: Record<LeadRecord["source"], string> = {
  kiosk: "کیوسک",
  booth: "غرفه",
}

const tehran = (at: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", ...options }).format(at)

export function toRow(record: LeadRecord): LeadRow {
  const at = new Date(record.submittedAt)
  const common = {
    id: record.id,
    date: tehran(at, { year: "numeric", month: "2-digit", day: "2-digit" }),
    time: tehran(at, { hour: "2-digit", minute: "2-digit", hour12: false }),
    sourceLabel: SOURCE_LABEL[record.source],
    name: record.name,
    organization: record.organization,
    mobile: record.mobile,
    interests: record.interests.join(" | "),
    notes: record.notes,
  }

  return record.source === "booth"
    ? { ...common, audience: record.audience, role: "", city: "", status: record.status }
    : {
        ...common,
        audience: TRACK_LABEL[record.track] ?? record.track,
        role: record.role,
        city: record.city,
        status: "",
      }
}

/** `YYYY-MM-DD` in Tehran. The booth's day, not the server's. */
export function tehranDay(at: Date = new Date()): string {
  return tehran(at, { year: "numeric", month: "2-digit", day: "2-digit" })
}
