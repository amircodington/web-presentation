"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Icon } from "@/components/ui/Icon"
import { toPersianDigits } from "@/lib/format"
import type { LeadRecord } from "@/lib/leads/schema"

const TRACK_LABELS: Record<LeadRecord["track"], string> = {
  schools: "مدرسه",
  organizations: "سازمان",
}

/**
 * The booth lead's view of the archive: read, download, delete.
 *
 * Written for a phone held in a loud hall rather than for a desk — one column,
 * large targets, and every destructive action behind a confirm, because the only
 * copy of a lead is the file this page can delete.
 */
export function LeadArchive({ token, records }: { token: string; records: LeadRecord[] }) {
  const router = useRouter()
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState("")
  const [refreshing, startRefresh] = useTransition()
  const working = busy !== "" || refreshing

  const href = (path: string) =>
    `/api/leads/archive${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`

  async function remove(id: string | null) {
    const message = id
      ? "این درخواست حذف شود؟ فایل آن برای همیشه پاک می‌شود."
      : `همه ${toPersianDigits(records.length)} درخواست حذف شوند؟ این کار برگشت‌پذیر نیست.`
    if (!window.confirm(message)) return

    setBusy(id ?? "all")
    setFailed(false)
    try {
      const response = await fetch(href(id ? `/${id}` : ""), { method: "DELETE" })
      if (!response.ok) throw new Error(String(response.status))
      startRefresh(() => router.refresh())
    } catch {
      setFailed(true)
    } finally {
      setBusy("")
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[900px] flex-col gap-6 p-6 pb-24">
      <header className="flex flex-col gap-2 border-b border-[var(--kiosk-border)] pb-6">
        <h1 className="text-3xl font-bold">درخواست‌های همکاری</h1>
        <p className="text-[var(--kiosk-muted)]">
          {toPersianDigits(records.length)} درخواست ثبت‌شده
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Action as="a" href={href("?format=pdf")} icon="qr" label="دانلود همه (PDF)" />
        <Action as="a" href={href("?format=csv")} icon="chart" label="دانلود همه (CSV)" />
        <Action
          icon="cross"
          label="حذف همه"
          tone="danger"
          disabled={records.length === 0 || working}
          onClick={() => void remove(null)}
        />
        <Action
          icon="next"
          label="به‌روزرسانی"
          disabled={working}
          onClick={() => startRefresh(() => router.refresh())}
        />
      </div>

      {failed ? (
        <p className="rounded-2xl bg-[var(--kiosk-accent)] px-5 py-4 font-semibold text-[var(--kiosk-on-accent)]">
          حذف انجام نشد. صفحه را دوباره باز کنید.
        </p>
      ) : null}

      {records.length === 0 ? (
        <p className="rounded-2xl border border-[var(--kiosk-border)] px-5 py-10 text-center text-[var(--kiosk-muted)]">
          هنوز درخواستی ثبت نشده است.
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {records.map((record) => (
          <li
            key={record.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--kiosk-border)] bg-[var(--kiosk-surface)] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold">{record.name}</h2>
              <span className="rounded-full bg-[var(--kiosk-accent)] px-3 py-1 text-sm font-bold text-[var(--kiosk-on-accent)]">
                {TRACK_LABELS[record.track]}
              </span>
            </div>

            <dl className="grid gap-x-6 gap-y-1 text-[var(--kiosk-text)] sm:grid-cols-2">
              <Row label="سمت" value={record.role} />
              <Row label="مدرسه / سازمان" value={record.organization} />
              <Row label="موبایل" value={toPersianDigits(record.mobile)} />
              {record.city ? <Row label="شهر" value={record.city} /> : null}
              <Row label="علاقه‌مندی" value={record.interests.join("، ")} />
              <Row label="زمان ثبت" value={formatStamp(record.submittedAt)} />
            </dl>

            {record.notes ? (
              <p className="rounded-xl bg-[var(--kiosk-bg)] px-4 py-3 leading-relaxed text-[var(--kiosk-muted)]">
                {record.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Action as="a" href={href(`/${record.id}`)} icon="qr" label="دانلود PDF" />
              <Action
                icon="cross"
                label="حذف"
                tone="danger"
                disabled={working}
                onClick={() => void remove(record.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-[var(--kiosk-muted)]">{label}:</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function formatStamp(iso: string): string {
  const at = new Date(iso)
  const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeZone: "Asia/Tehran",
  }).format(at)
  const time = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tehran",
  }).format(at)
  return `${date} — ${time}`
}

type ActionProps = {
  icon: Parameters<typeof Icon>[0]["name"]
  label: string
  tone?: "default" | "danger"
  as?: "a"
  href?: string
  disabled?: boolean
  onClick?: () => void
}

function Action({ icon, label, tone = "default", as, href, disabled, onClick }: ActionProps) {
  const skin =
    tone === "danger"
      ? "border-[var(--kiosk-accent)] text-[var(--kiosk-accent)]"
      : "border-[var(--kiosk-border)] text-[var(--kiosk-text)]"
  const className = `inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full border-2 px-5 font-semibold transition-opacity disabled:opacity-40 ${skin}`

  if (as === "a") {
    return (
      <a className={className} href={href} download>
        <Icon name={icon} size={20} />
        {label}
      </a>
    )
  }

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      <Icon name={icon} size={20} />
      {label}
    </button>
  )
}
