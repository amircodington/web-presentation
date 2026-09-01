const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const

/**
 * Renders Latin digits as Persian ones.
 *
 * Done here rather than by swapping to a font whose numerals happen to be Persian,
 * so digit shaping stays correct regardless of which weight or fallback is in use.
 */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]!)
}

const ARABIC_INDIC_ZERO = 0x0660
const PERSIAN_ZERO = 0x06f0

/**
 * Renders Persian and Arabic-Indic digits as Latin ones.
 *
 * Anything typed on a Persian keyboard arrives as U+06Fx, and anything pasted
 * from a phone contact list may arrive as U+066x. Both have to reach validation
 * and storage as `09…` or a valid number is rejected as malformed.
 */
export function toLatinDigits(value: string): string {
  return value.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (digit) => {
    const code = digit.codePointAt(0)!
    const zero = code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_INDIC_ZERO
    return String(code - zero)
  })
}

/** Formats a Toman price with thousand separators and Persian digits. */
export function formatPrice(toman: number): string {
  if (toman === 0) return "رایگان"
  return `${toPersianDigits(toman.toLocaleString("en-US"))} تومان`
}

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const

/**
 * Formats an ISO Gregorian date as a Jalali one.
 *
 * Content stores Gregorian so that sorting and "is this still upcoming" stay
 * trivial comparisons; conversion happens once, here, and never inline in a
 * component.
 */
export function formatJalali(isoDate: string): string {
  const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).formatToParts(new Date(`${isoDate}T00:00:00Z`))

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  const month = JALALI_MONTHS[get("month") - 1] ?? ""
  return `${toPersianDigits(get("day"))} ${month} ${toPersianDigits(get("year"))}`
}

/** Percentage of a workshop's capacity already taken, for the "almost full" badge. */
export function fillRatio(taken: number, capacity: number): number {
  if (capacity <= 0) return 0
  return Math.min(1, Math.max(0, taken / capacity))
}
