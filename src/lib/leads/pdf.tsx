import "server-only"
import path from "node:path"
import React from "react"
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { toRow } from "./view"
import type { LeadRecord } from "./schema"

/**
 * Renders the lead archive as a printable Persian document.
 *
 * The PDF is generated on demand from the stored JSON rather than written
 * alongside it: the JSON is the record, the PDF is a view of it, so a change to
 * this layout re-renders every past lead instead of leaving the archive in two
 * different designs.
 */

/**
 * The same typeface the screen uses, so a printed lead and the kiosk that
 * captured it read as one thing.
 *
 * The path is a literal under `process.cwd()` on purpose — see
 * `public/fonts/README.md`. Resolving it from `node_modules` at runtime either
 * breaks in the standalone build or drags the entire project into it.
 */
const fontDir = path.join(process.cwd(), "public", "fonts")

Font.register({
  family: "Vazirmatn",
  fonts: [
    { src: path.join(fontDir, "Vazirmatn-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "Vazirmatn-Bold.ttf"), fontWeight: 700 },
  ],
})

// Persian has no hyphenation; the default callback breaks words mid-glyph-run.
Font.registerHyphenationCallback((word) => [word])

const c = content.brand.colors

const styles = StyleSheet.create({
  page: {
    fontFamily: "Vazirmatn",
    direction: "rtl",
    fontSize: 10,
    color: c.cardText,
    backgroundColor: "#FFFFFF",
    paddingTop: 28,
    paddingBottom: 44,
    paddingHorizontal: 34,
  },
  header: {
    backgroundColor: c.background,
    color: c.text,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 17, fontWeight: 700, color: c.text },
  tagline: { fontSize: 9, color: c.textMuted, marginTop: 3 },
  headerMeta: { fontSize: 9, color: c.textMuted, textAlign: "left", lineHeight: 1.7 },
  headerTitle: { fontSize: 12, color: c.money, fontWeight: 700, marginTop: 12 },

  card: {
    borderWidth: 1,
    borderColor: "#E2E0D8",
    borderRadius: 8,
    backgroundColor: c.card,
    padding: 12,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E0D8",
    paddingBottom: 7,
    marginBottom: 8,
  },
  cardName: { fontSize: 13, fontWeight: 700 },
  trackTag: {
    fontSize: 8,
    fontWeight: 700,
    color: c.onAccent,
    backgroundColor: c.accent,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 78, color: c.cardMuted, fontSize: 9 },
  value: { flex: 1, fontSize: 10, lineHeight: 1.6 },
  mobile: { fontSize: 11, fontWeight: 700, color: c.accent },
  chips: { flexDirection: "row", flexWrap: "wrap", flex: 1, gap: 4 },
  chip: {
    fontSize: 9,
    backgroundColor: c.accentSoft,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  notes: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E0D8",
    fontSize: 9.5,
    lineHeight: 1.8,
    color: c.cardMuted,
  },
  empty: { textAlign: "center", color: c.cardMuted, marginTop: 60, fontSize: 11 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: c.cardMuted,
  },
})

/**
 * Forces a right-to-left paragraph for a string of visitor-entered text.
 *
 * `@react-pdf` resolves each text run's direction from its first strong
 * character, and a digit is not one — so a line beginning with a Persian date
 * or a number renders that first number at the far left. The mark is invisible
 * and costs nothing; guessing which values start with a digit does not work,
 * because the values are typed by the public.
 */
const rtl = (text: string) => `\u200f${text}`



/**
 * Jalali date and 24-hour clock in Tehran, which is the only clock anyone
 * following these leads up will be reading.
 *
 * The two parts are joined here rather than in JSX on purpose: `@react-pdf`
 * resolves bidirectional runs per text child, so `{date} — ساعت {time}` sends
 * the day number to the far side of the line. One child, one run, correct order.
 */
function formatStamp(iso: string): { date: string; label: string } {
  const at = new Date(iso)
  const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).format(at)
  const time = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tehran",
  }).format(at)
  return { date, label: rtl(`${date} — ساعت ${time}`) }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

function LeadCard({ record }: { record: LeadRecord }) {
  const row = toRow(record)
  const stamp = formatStamp(record.submittedAt)
  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.cardTop}>
        <Text style={styles.cardName}>{rtl(record.name)}</Text>
        <Text style={styles.trackTag}>{row.audience}</Text>
      </View>

      {row.role ? (
        <Field label="سمت">
          <Text style={styles.value}>{rtl(row.role)}</Text>
        </Field>
      ) : null}
      {row.status ? (
        <Field label="وضعیت">
          <Text style={styles.value}>{rtl(row.status)}</Text>
        </Field>
      ) : null}
      {row.organization ? (
        <Field label="مدرسه / سازمان">
          <Text style={styles.value}>{rtl(row.organization)}</Text>
        </Field>
      ) : null}
      <Field label="موبایل">
        <Text style={styles.mobile}>{toPersianDigits(record.mobile)}</Text>
      </Field>
      {row.city ? (
        <Field label="شهر">
          <Text style={styles.value}>{rtl(row.city)}</Text>
        </Field>
      ) : null}
      <Field label="علاقه‌مندی">
        <View style={styles.chips}>
          {record.interests.map((interest) => (
            <Text key={interest} style={styles.chip}>
              {interest}
            </Text>
          ))}
        </View>
      </Field>
      <Field label="زمان ثبت">
        <Text style={styles.value}>{stamp.label}</Text>
      </Field>

      {record.notes ? <Text style={styles.notes}>{rtl(record.notes)}</Text> : null}
    </View>
  )
}

function Archive({ records, title }: { records: readonly LeadRecord[]; title: string }) {
  const printed = formatStamp(new Date().toISOString())
  return (
    <Document
      title={title}
      author={content.brand.nameEn}
      language="fa"
      creator={content.brand.nameEn}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brand}>{content.brand.nameFa}</Text>
              <Text style={styles.tagline}>{content.brand.tagline}</Text>
            </View>
            <Text style={styles.headerMeta}>
              {content.contact.website}
              {"\n"}
              {content.contact.phone}
            </Text>
          </View>
          <Text style={styles.headerTitle}>
            {title} — {toPersianDigits(records.length)} مورد — خروجی {printed.date}
          </Text>
        </View>

        {records.length === 0 ? (
          <Text style={styles.empty}>هنوز درخواستی ثبت نشده است.</Text>
        ) : (
          records.map((record) => <LeadCard key={record.id} record={record} />)
        )}

        <View style={styles.footer} fixed>
          <Text
            render={({ pageNumber, totalPages }) =>
              `صفحه ${toPersianDigits(pageNumber)} از ${toPersianDigits(totalPages)}`
            }
          />
          <Text>{content.brand.nameFa}</Text>
        </View>
      </Page>
    </Document>
  )
}

/** Renders one or many leads to a PDF buffer. */
export function renderLeadsPdf(records: readonly LeadRecord[], title: string): Promise<Buffer> {
  return renderToBuffer(<Archive records={records} title={title} />)
}
