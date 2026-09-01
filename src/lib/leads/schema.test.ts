import { describe, expect, it } from "vitest"
import { LeadRecordSchema, LeadSubmissionSchema } from "./schema"

const STORED_BEFORE_BOOTH = {
  id: "20260831-101500-deadbeef",
  submittedAt: "2026-08-31T10:15:00.000Z",
  appVersion: "0.2.0",
  track: "schools",
  name: "مریم رضایی",
  role: "مدیر مدرسه",
  organization: "دبیرستان نمونه",
  mobile: "09121234567",
  city: "تهران",
  interests: ["یک روز متفاوت"],
  notes: "",
}

describe("LeadRecordSchema", () => {
  /**
   * The archive skips any file it cannot parse. A record shape that stopped
   * accepting what is already on the disk would therefore not error — it would
   * silently show an empty archive, which is the worst way to lose leads.
   */
  it("still reads records written before the booth tablet existed", () => {
    const parsed = LeadRecordSchema.safeParse(STORED_BEFORE_BOOTH)
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.source).toBe("kiosk")
  })

  it("reads a booth record", () => {
    const parsed = LeadRecordSchema.safeParse({
      ...STORED_BEFORE_BOOTH,
      source: "booth",
      audience: "نوجوان",
      status: "آماده ثبت‌نام",
      organization: "",
    })
    expect(parsed.success).toBe(true)
  })
})

describe("LeadSubmissionSchema", () => {
  const BOOTH = {
    source: "booth",
    audience: "والد",
    name: "زهرا کریمی",
    organization: "",
    mobile: "09129876543",
    interests: ["مسیر ثروت"],
    status: "نیاز به پیگیری",
    notes: "",
  }

  it("accepts a booth lead with no organisation", () => {
    expect(LeadSubmissionSchema.safeParse(BOOTH).success).toBe(true)
  })

  it("rejects a malformed mobile whichever shape it arrives in", () => {
    expect(LeadSubmissionSchema.safeParse({ ...BOOTH, mobile: "12345" }).success).toBe(false)
  })

  it("rejects a booth lead with no interest selected", () => {
    expect(LeadSubmissionSchema.safeParse({ ...BOOTH, interests: [] }).success).toBe(false)
  })
})
