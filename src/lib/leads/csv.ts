import { toRow, type LeadRow } from "./view"
import type { LeadRecord } from "./schema"

const COLUMNS: readonly (readonly [keyof LeadRow, string])[] = [
  ["date", "تاریخ"],
  ["time", "ساعت"],
  ["sourceLabel", "محل ثبت"],
  ["audience", "نوع مخاطب"],
  ["name", "نام"],
  ["role", "سمت"],
  ["organization", "مدرسه / سازمان"],
  ["mobile", "موبایل"],
  ["city", "شهر"],
  ["interests", "علاقه‌مندی"],
  ["status", "وضعیت"],
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
    const row = toRow(record)
    return COLUMNS.map(([key]) => quote(row[key])).join(",")
  })
  return "﻿" + [header, ...rows].join("\r\n") + "\r\n"
}
