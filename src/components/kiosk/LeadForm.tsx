"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { toLatinDigits } from "@/lib/format"
import type { CollaborationTrack } from "@/content/schema/collaboration"

interface LeadFormProps {
  track: CollaborationTrack
  /** `schools` or `organizations`, stored with the lead so the archive can group. */
  trackKey: "schools" | "organizations"
  onClose: () => void
}

type Draft = {
  name: string
  role: string
  organization: string
  mobile: string
  city: string
  interests: string[]
  notes: string
}

const EMPTY: Draft = {
  name: "",
  role: "",
  organization: "",
  mobile: "",
  city: "",
  interests: [],
  notes: "",
}

const FIELD =
  "min-h-[88px] w-full rounded-2xl border-2 border-[color-mix(in_oklab,var(--kiosk-card-text)_14%,transparent)] bg-white px-6 text-[28px] text-[var(--kiosk-card-text)] outline-none focus:border-[var(--kiosk-accent)]"

/**
 * The collaboration request form, shown over the scene it was opened from.
 *
 * It sits on a light mat rather than the dark board because it is the one place
 * on the kiosk where a visitor reads and writes several lines at close range,
 * and reversed-out body copy is unreadable at that distance (AGENTS.md §8).
 *
 * Nothing is kept if the visitor walks away: there is no draft persistence, and
 * the idle reset unmounts the whole scene tree — a half-typed phone number must
 * never greet the next person.
 *
 * It also carries the scenes' `pb-52` chrome clearance and never scrolls: the
 * persistent controls float above everything, and a field or a submit button
 * hidden under them is a form nobody can finish.
 */
export function LeadForm({ track, trackKey, onClose }: LeadFormProps) {
  const copy = track.form
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(onClose, kioskConfig.successResetMs)
    return () => clearTimeout(timer)
  }, [done, onClose])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setError("")
  }

  const toggleInterest = (title: string) =>
    set(
      "interests",
      draft.interests.includes(title)
        ? draft.interests.filter((item) => item !== title)
        : [...draft.interests, title],
    )

  async function submit() {
    const mobile = toLatinDigits(draft.mobile).replace(/\D/g, "")

    if (draft.name.trim().length < 2) return setError(copy.errors.name)
    if (!draft.role) return setError(copy.errors.role)
    if (draft.organization.trim().length < 2) return setError(copy.errors.organization)
    if (!/^09\d{9}$/.test(mobile)) return setError(copy.errors.mobile)
    if (draft.interests.length === 0) return setError(copy.errors.interests)

    setPending(true)
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          track: trackKey,
          name: draft.name.trim(),
          role: draft.role,
          organization: draft.organization.trim(),
          mobile,
          city: draft.city.trim(),
          interests: draft.interests,
          notes: draft.notes.trim(),
        }),
      })
      if (!response.ok) throw new Error(String(response.status))
      setDone(true)
    } catch {
      setError(copy.errors.submit)
    } finally {
      setPending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 grid place-items-center rounded-[48px] bg-[color-mix(in_oklab,var(--kiosk-bg)_78%,transparent)] px-16 pt-8 pb-48 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className="mat flex max-h-full w-full flex-col gap-4 rounded-[40px] p-8"
      >
        {done ? (
          <Success title={copy.successTitle} body={copy.successBody} />
        ) : (
          <>
            <header className="flex items-start justify-between gap-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-[36px] leading-tight font-bold">{copy.title}</h3>
                {error ? (
                  <p role="alert" className="text-[23px] font-bold text-[var(--kiosk-accent)]">
                    {error}
                  </p>
                ) : (
                  <p className="text-[23px] text-[var(--kiosk-card-muted)]">{copy.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.cancelLabel}
                className="grid size-[88px] shrink-0 cursor-pointer place-items-center rounded-full border-2 border-[color-mix(in_oklab,var(--kiosk-card-text)_16%,transparent)] text-[var(--kiosk-card-text)]"
              >
                <Icon name="cross" size={36} />
              </button>
            </header>

            <div className="grid grid-cols-2 items-start gap-x-9 gap-y-4">
              <Group label={copy.nameLabel}>
                <input
                  className={FIELD}
                  value={draft.name}
                  aria-label={copy.nameLabel}
                  placeholder={copy.namePlaceholder}
                  onChange={(event) => set("name", event.target.value)}
                />
              </Group>
              <Group label={copy.roleLabel}>
                <div role="group" aria-label={copy.roleLabel} className="flex flex-wrap gap-3">
                  {track.audience.map((role) => (
                    <Option
                      key={role}
                      label={role}
                      selected={draft.role === role}
                      onSelect={() => set("role", role)}
                    />
                  ))}
                </div>
              </Group>

              <Group label={copy.organizationLabel}>
                <input
                  className={FIELD}
                  value={draft.organization}
                  aria-label={copy.organizationLabel}
                  placeholder={copy.organizationPlaceholder}
                  onChange={(event) => set("organization", event.target.value)}
                />
              </Group>
              <Group label={copy.interestLabel} hint={copy.interestHint}>
                <div role="group" aria-label={copy.interestLabel} className="flex flex-wrap gap-3">
                  {track.cards.map((card) => (
                    <Option
                      key={card.title}
                      label={card.title}
                      selected={draft.interests.includes(card.title)}
                      onSelect={() => toggleInterest(card.title)}
                    />
                  ))}
                </div>
              </Group>

              <div className="grid grid-cols-2 gap-5">
                <Group label={copy.mobileLabel}>
                  <input
                    className={FIELD}
                    value={draft.mobile}
                    inputMode="tel"
                    aria-label={copy.mobileLabel}
                  placeholder={copy.mobilePlaceholder}
                    onChange={(event) => set("mobile", event.target.value)}
                  />
                </Group>
                <Group label={copy.cityLabel}>
                  <input
                    className={FIELD}
                    value={draft.city}
                    aria-label={copy.cityLabel}
                  placeholder={copy.cityPlaceholder}
                    onChange={(event) => set("city", event.target.value)}
                  />
                </Group>
              </div>
              <Group label={copy.notesLabel}>
                <textarea
                  className={`${FIELD} min-h-[104px] py-4 leading-relaxed`}
                  value={draft.notes}
                  aria-label={copy.notesLabel}
                  placeholder={copy.notesPlaceholder}
                  onChange={(event) => set("notes", event.target.value)}
                />
              </Group>
            </div>

            <footer className="flex items-center gap-4">
              <Button className="flex-1" onClick={pending ? undefined : submit}>
                {copy.submitLabel}
              </Button>
              <Button variant="paper" onClick={onClose}>
                {copy.cancelLabel}
              </Button>
            </footer>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * A caption over a field or a row of choices.
 *
 * Deliberately not a `<label>`: a `<button>` is a labelable control, so wrapping
 * the choice rows in one makes every chip announce the entire group's text as
 * its own name. The caption is plain text and each control carries its own
 * `aria-label` instead.
 */
function Group({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[26px] font-bold text-[var(--kiosk-card-text)]">
        {label}
        {hint ? (
          <span className="ms-3 text-[21px] font-medium text-[var(--kiosk-card-muted)]">{hint}</span>
        ) : null}
      </span>
      {children}
    </div>
  )
}

function Option({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`min-h-[88px] cursor-pointer rounded-2xl border-2 px-7 text-[26px] font-semibold transition-colors duration-[var(--duration-instant)] ${
        selected
          ? "border-transparent bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)]"
          : "border-[color-mix(in_oklab,var(--kiosk-card-text)_16%,transparent)] text-[var(--kiosk-card-text)]"
      }`}
    >
      {label}
    </button>
  )
}

function Success({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-6 px-10 py-16 text-center"
    >
      <span className="grid size-[132px] place-items-center rounded-full bg-[var(--kiosk-positive)] text-[var(--kiosk-card-text)]">
        <Icon name="check" size={64} />
      </span>
      <h3 className="text-[48px] font-bold">{title}</h3>
      <p className="max-w-[720px] text-[28px] text-[var(--kiosk-card-muted)]">{body}</p>
    </motion.div>
  )
}
