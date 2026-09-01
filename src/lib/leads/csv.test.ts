import { describe, expect, it } from "vitest"
import { leadsToCsv } from "./csv"
import type { LeadRecord } from "./schema"

const RECORD: LeadRecord = {
  id: "20260901-141500-deadbeef",
  submittedAt: "2026-09-01T14:15:00.000Z",
  appVersion: "0.1.0",
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
    const [, row] = leadsToCsv([RECORD]).split("\r\n")
    expect(row).toContain('"2026-09-01"')
    expect(row).toContain('"14:15"')
  })

  it("writes a header even with nothing to export", () => {
    expect(leadsToCsv([]).trim().split("\r\n")).toHaveLength(1)
  })
})
