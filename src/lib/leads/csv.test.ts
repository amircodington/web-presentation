import { describe, expect, it } from "vitest"
import { leadsToCsv } from "./csv"
import type { LeadRecord } from "./schema"

const RECORD: LeadRecord = {
  id: "20260901-141500-deadbeef",
  submittedAt: "2026-09-01T14:15:00.000Z",
  appVersion: "0.1.0",
  source: "kiosk",
  track: "organizations",
  name: 'شرکت "الف"',
  role: "مدیر منابع انسانی",
  organization: "هلدینگ نمونه",
  mobile: "09121234567",
  city: "",
  interests: ["آموزش کارکنان", "پروژه‌های عمومی"],
  notes: "تماس بعدازظهر",
}

describe("leadsToCsv", () => {
  it("leads with a BOM so Excel reads it as UTF-8", () => {
    expect(leadsToCsv([])).toMatch(/^﻿/)
  })

  it("doubles embedded quotes instead of ending the field", () => {
    expect(leadsToCsv([RECORD])).toContain('"شرکت ""الف"""')
  })

  it("joins multiple interests into one cell", () => {
    expect(leadsToCsv([RECORD])).toContain('"آموزش کارکنان | پروژه‌های عمومی"')
  })

  it("splits the timestamp into a date and a time column", () => {
    // In Tehran, which is where the booth is and the only clock anyone
    // following these leads up is reading. 14:15Z is 17:45 local — exporting
    // the UTC time sends the caller to the wrong half of the evening.
    const [, row] = leadsToCsv([RECORD]).split("\r\n")
    expect(row).toContain('"2026-09-01"')
    expect(row).toContain('"17:45"')
  })

  it("writes a header even with nothing to export", () => {
    expect(leadsToCsv([]).trim().split("\r\n")).toHaveLength(1)
  })
})

const BOOTH_RECORD: LeadRecord = {
  id: "20260901-141600-cafebabe",
  submittedAt: "2026-09-01T14:16:00.000Z",
  appVersion: "0.3.0",
  source: "booth",
  audience: "والد",
  name: "زهرا کریمی",
  organization: "",
  mobile: "09129876543",
  interests: ["مسیر ثروت"],
  status: "نیاز به پیگیری",
  notes: "",
}

describe("leadsToCsv across both capture shapes", () => {
  it("puts both shapes on the same columns", () => {
    const lines = leadsToCsv([RECORD, BOOTH_RECORD]).trim().split("\r\n")
    const widths = new Set(lines.map((line) => line.split(",").length))
    expect(widths.size).toBe(1)
  })

  it("labels where each lead was captured", () => {
    const csv = leadsToCsv([RECORD, BOOTH_RECORD])
    expect(csv).toContain('"کیوسک"')
    expect(csv).toContain('"غرفه"')
  })

  it("carries the booth's follow-up status, which the kiosk never collects", () => {
    expect(leadsToCsv([BOOTH_RECORD])).toContain('"نیاز به پیگیری"')
  })
})
