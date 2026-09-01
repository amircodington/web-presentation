"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toLatinDigits, toPersianDigits } from "@/lib/format"
import type { Booth } from "@/content/schema/booth"

/** A lead already captured today, as the tablet needs to show it. */
interface Captured {
  id: string
  name: string
  mobile: string
  time: string
}

interface Props {
  copy: Booth
  token: string
  today: readonly Captured[]
}

/** Queue key. Versioned so a shape change cannot resurrect an unreadable draft. */
const QUEUE_KEY = "wealthClubBoothQueueV1"
const RECENT_SHOWN = 6

interface Draft {
  audience: string
  name: string
  mobile: string
  organization: string
  interests: string[]
  status: string
  notes: string
}

const EMPTY: Draft = {
  audience: "",
  name: "",
  mobile: "",
  organization: "",
  interests: [],
  status: "",
  notes: "",
}

/**
 * The booth staff's capture tablet: one visitor, six taps, next.
 *
 * This is the other half of lead capture. The kiosk's own form is filled in by a
 * school or an organisation that chose to leave a number; this is a member of
 * staff logging the teenager or parent they just finished talking to, and most of
 * the booth's traffic is that second kind.
 *
 * Everything goes to the same server archive rather than to this browser. A
 * tablet's local storage is one cleared cache away from losing a festival's
 * leads, cannot be read from the office, and splits the day in two the moment a
 * second member of staff picks up a second device.
 *
 * The network, though, is the venue's. A submission that cannot reach the server
 * is queued on the device and retried rather than lost — the visitor has already
 * walked away by the time anyone would notice a failure.
 */
export function BoothCapture({ copy, token, today }: Props) {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [captured, setCaptured] = useState<readonly Captured[]>(today)
  const [queued, setQueued] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "err" }>()
  const nameRef = useRef<HTMLInputElement>(null)

  const audience = copy.audiences.find((option) => option.id === draft.audience)
  const needsOrganization = audience?.needsOrganization ?? false

  const flash = (text: string, tone: "ok" | "err" = "ok") => {
    setMessage({ text, tone })
    window.setTimeout(() => setMessage(undefined), 2600)
  }

  const readQueue = (): unknown[] => {
    try {
      const raw = window.localStorage.getItem(QUEUE_KEY)
      return raw ? (JSON.parse(raw) as unknown[]) : []
    } catch {
      return []
    }
  }

  const writeQueue = (items: unknown[]) => {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
    setQueued(items.length)
  }

  /**
   * Sends anything stranded on the device, and publishes what is still waiting.
   * Safe to call at any time; it is the only writer of the queued count.
   */
  const drainQueue = useCallback(async () => {
    const items = readQueue()
    if (items.length === 0) {
      setQueued(0)
      return
    }
    const left: unknown[] = []
    for (const item of items) {
      try {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(item),
        })
        // A rejected body will never become acceptable on a retry, so it is
        // dropped rather than queued forever behind the leads that would send.
        if (!response.ok && response.status < 500) continue
        if (!response.ok) left.push(item)
      } catch {
        left.push(item)
      }
    }
    writeQueue(left)
  }, [])

  useEffect(() => {
    // Deferred a tick rather than run in the effect body: the first drain reads
    // localStorage and publishes a count, and doing that inside the mounting
    // commit is a cascading render for state no one is looking at yet.
    const timer = window.setTimeout(() => void drainQueue(), 0)
    window.addEventListener("online", drainQueue)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("online", drainQueue)
    }
  }, [drainQueue])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const toggleInterest = (id: string) =>
    setDraft((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((value) => value !== id)
        : [...current.interests, id],
    }))

  const labelFor = (list: readonly { id: string; label: string }[], id: string) =>
    list.find((option) => option.id === id)?.label ?? id

  const submit = async () => {
    const name = draft.name.trim()
    const mobile = toLatinDigits(draft.mobile).replace(/\D/g, "")
    const organization = draft.organization.trim()

    if (!draft.audience) return flash(copy.errors.audience, "err")
    if (name.length < 2) return flash(copy.errors.name, "err")
    if (!/^09\d{9}$/.test(mobile)) return flash(copy.errors.mobile, "err")
    if (needsOrganization && organization.length < 2) return flash(copy.errors.organization, "err")
    if (draft.interests.length === 0) return flash(copy.errors.interests, "err")
    if (!draft.status) return flash(copy.errors.status, "err")

    if (
      captured.some((entry) => entry.mobile === mobile) &&
      !window.confirm(copy.duplicateWarning)
    ) {
      return
    }

    const submission = {
      source: "booth" as const,
      audience: labelFor(copy.audiences, draft.audience),
      name,
      organization,
      mobile,
      interests: draft.interests.map((id) => labelFor(copy.interests, id)),
      status: labelFor(copy.statuses, draft.status),
      notes: draft.notes.trim(),
    }

    setBusy(true)
    let stored = true
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      })
      if (!response.ok) throw new Error(String(response.status))
    } catch {
      stored = false
      writeQueue([...readQueue(), submission])
    }
    setBusy(false)

    // Counted either way. The lead is captured the moment staff pressed save;
    // whether it has reached the disk yet is the queue's problem, not theirs,
    // and a counter that stalls makes them re-enter a visitor who has left.
    setCaptured((current) => [
      { id: `${Date.now()}`, name, mobile, time: nowInTehran() },
      ...current,
    ])
    setDraft(EMPTY)
    nameRef.current?.focus()
    flash(stored ? copy.savedMessage : copy.errors.network, stored ? "ok" : "err")
    if (!stored) void drainQueue()
  }

  const href = (query: string) =>
    `/api/leads/archive?${query}&token=${encodeURIComponent(token)}`

  return (
    <main className="mx-auto flex max-w-[860px] flex-col gap-4 p-4 pb-16">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-black">{copy.title}</h1>
          <p className="text-[16px] text-[var(--kiosk-muted)]">{copy.subtitle}</p>
        </div>
        <div className="shrink-0 rounded-2xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-5 py-2 text-center text-[var(--kiosk-on-accent)]">
          <span className="block text-[13px] font-medium opacity-90">{copy.todayLabel}</span>
          <b className="block text-[30px] leading-none font-black tabular-nums">
            {toPersianDigits(captured.length)}
          </b>
        </div>
      </header>

      {queued > 0 ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-money)] px-4 py-3 text-[var(--kiosk-card-text)]">
          <span className="font-bold">
            {copy.queuedLabel}: {toPersianDigits(queued)}
          </span>
          <button
            type="button"
            onClick={() => void drainQueue()}
            className="rounded-xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-card)] px-4 py-2 font-bold"
          >
            {copy.retryLabel}
          </button>
        </div>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-2xl border-[3px] border-[var(--kiosk-border)] px-4 py-3 font-bold"
          style={{
            background:
              message.tone === "ok"
                ? "color-mix(in oklab, var(--kiosk-positive) 22%, var(--kiosk-card))"
                : "var(--kiosk-accent-soft)",
            color: message.tone === "ok" ? "var(--kiosk-card-text)" : "var(--kiosk-accent)",
          }}
        >
          {message.text}
        </p>
      ) : null}

      <Card title={copy.audienceLabel}>
        <Options
          options={copy.audiences}
          selected={[draft.audience]}
          onSelect={(id) => set("audience", id)}
        />
      </Card>

      <Card title={copy.contactLabel}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={copy.nameLabel}>
            <input
              ref={nameRef}
              value={draft.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder={copy.namePlaceholder}
              className={INPUT}
            />
          </Field>
          <Field label={copy.mobileLabel}>
            <input
              value={draft.mobile}
              onChange={(event) => set("mobile", event.target.value)}
              inputMode="numeric"
              maxLength={13}
              dir="ltr"
              placeholder={copy.mobilePlaceholder}
              className={`${INPUT} text-left`}
            />
          </Field>
        </div>
        {needsOrganization ? (
          <Field label={copy.organizationLabel}>
            <input
              value={draft.organization}
              onChange={(event) => set("organization", event.target.value)}
              placeholder={copy.organizationPlaceholder}
              className={INPUT}
            />
          </Field>
        ) : null}
      </Card>

      <Card title={copy.interestLabel} hint={copy.interestHint}>
        <Options options={copy.interests} selected={draft.interests} onSelect={toggleInterest} />
      </Card>

      <Card title={copy.statusLabel}>
        <Options
          options={copy.statuses}
          selected={[draft.status]}
          onSelect={(id) => set("status", id)}
        />
        <Field label={copy.notesLabel}>
          <textarea
            value={draft.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder={copy.notesPlaceholder}
            className={`${INPUT} min-h-[88px]`}
          />
        </Field>
      </Card>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy}
        className="min-h-[76px] rounded-2xl border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] text-[22px] font-black text-[var(--kiosk-on-accent)] shadow-[6px_6px_0_0_var(--kiosk-border)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:opacity-60"
      >
        {busy ? copy.savingLabel : copy.saveLabel}
      </button>

      {captured.length > 0 ? (
        <Card title={copy.recentLabel}>
          <ul className="flex flex-col gap-2">
            {captured.slice(0, RECENT_SHOWN).map((entry) => (
              <li
                key={entry.id}
                className="flex items-baseline justify-between gap-3 border-b border-[color-mix(in_oklab,var(--kiosk-border)_20%,transparent)] pb-2 text-[16px] last:border-0"
              >
                <span className="font-bold">{entry.name}</span>
                <span dir="ltr" className="text-[var(--kiosk-muted)] tabular-nums">
                  {toPersianDigits(entry.mobile)}
                </span>
                <span className="text-[var(--kiosk-muted)] tabular-nums">
                  {toPersianDigits(entry.time)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title={copy.exportTitle}>
        <div className="flex flex-wrap gap-3">
          <a href={href("format=csv")} className={TOOL}>
            {copy.csvLabel}
          </a>
          <a href={href("format=json&download=1")} className={TOOL}>
            {copy.jsonLabel}
          </a>
          <a href={href("format=pdf")} className={TOOL}>
            {copy.pdfLabel}
          </a>
        </div>
        <p className="text-[14px] leading-relaxed text-[var(--kiosk-muted)]">{copy.exportHint}</p>
      </Card>
    </main>
  )
}

const INPUT =
  "w-full rounded-xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-card)] px-4 py-3 text-[18px] text-[var(--kiosk-card-text)] outline-none focus:border-[var(--kiosk-accent)]"

const TOOL =
  "inline-flex min-h-[56px] items-center rounded-xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-card)] px-5 text-[17px] font-bold text-[var(--kiosk-card-text)]"

/** `HH:mm` in Tehran, matching what the server writes for earlier captures. */
function nowInTehran(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())
}

function Card({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-card)] p-4 text-[var(--kiosk-card-text)]">
      <h2 className="text-[19px] font-black">
        {title}
        {hint ? (
          <span className="ms-2 text-[14px] font-medium text-[var(--kiosk-card-muted)]">
            {hint}
          </span>
        ) : null}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[15px] font-bold">
      {label}
      {children}
    </label>
  )
}

/**
 * The tap targets. 60px minimum: this is used standing up, one-handed, by
 * someone still talking to the visitor they are logging.
 */
function Options({
  options,
  selected,
  onSelect,
}: {
  options: readonly { id: string; label: string }[]
  selected: readonly string[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const on = selected.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(option.id)}
            className="min-h-[60px] rounded-xl border-[3px] px-3 text-[17px] font-bold"
            style={{
              borderColor: on ? "var(--kiosk-accent)" : "var(--kiosk-border)",
              background: on ? "var(--kiosk-accent)" : "var(--kiosk-card)",
              color: on ? "var(--kiosk-on-accent)" : "var(--kiosk-card-text)",
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
