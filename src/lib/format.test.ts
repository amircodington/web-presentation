import { describe, expect, it } from "vitest"
import { formatJalali, formatPrice, toPersianDigits } from "./format"

describe("toPersianDigits", () => {
  it("converts every digit", () => {
    expect(toPersianDigits("0123456789")).toBe("۰۱۲۳۴۵۶۷۸۹")
  })

  it("leaves non-digits untouched", () => {
    expect(toPersianDigits("۱۲ تا ۱۵ سال")).toBe("۱۲ تا ۱۵ سال")
    expect(toPersianDigits("A-1")).toBe("A-۱")
  })

  it("accepts numbers", () => {
    expect(toPersianDigits(2026)).toBe("۲۰۲۶")
  })
})

describe("formatPrice", () => {
  it("renders zero as free rather than a price", () => {
    expect(formatPrice(0)).toBe("رایگان")
  })

  it("separates thousands and uses Persian digits", () => {
    expect(formatPrice(3400000)).toBe("۳,۴۰۰,۰۰۰ تومان")
  })
})

describe("formatJalali", () => {
  it("converts a Gregorian date to Jalali", () => {
    expect(formatJalali("2026-09-15")).toBe("۲۴ شهریور ۱۴۰۵")
  })

  it("handles the Nowruz boundary", () => {
    expect(formatJalali("2026-03-21")).toContain("فروردین")
  })
})
