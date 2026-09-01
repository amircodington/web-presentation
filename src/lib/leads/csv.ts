import type { LeadRecord } from "./schema"

const COLUMNS: readonly (readonly [keyof LeadRecord | "date" | "time", string])[] = [
  ["date", "تاریخ"],
  ["time", "ساعت"],
  ["track", "مسیر"],
  ["name", "نام"],
  ["role", "سمت"],
  ["organization", "مدرسه / سازمان"],
  ["mobile", "موبایل"],
  ["city", "شهر"],
  ["interests", "علاقه‌مندی"],
  ["notes", "توضیح"],
  ["id", "شناسه"],
]

const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`

/**
 * Excel-openable export of the archive.
 *
 * The BOM is load-bearing: without it Excel on Windows reads a UTF-8 CSV as
 * Windows-1256 and every Persian name arrives as mojibake.
 */
export function leadsToCsv(records: readonly LeadRecord[]): string {
  const header = COLUMNS.map(([, label]) => quote(label)).join(",")
  const rows = records.map((record) => {
    const at = new Date(record.submittedAt)
    const cells = COLUMNS.map(([key]) => {
      if (key === "date") return at.toISOString().slice(0, 10)
      if (key === "time") return at.toISOString().slice(11, 16)
      if (key === "interests") return record.interests.join(" | ")
      return record[key]
    })
    return cells.map(quote).join(",")
  })
  return "﻿" + [header, ...rows].join("\r\n") + "\r\n"
}
