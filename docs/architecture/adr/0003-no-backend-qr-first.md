# 0003 — No backend; QR-first lead capture

**Status:** Accepted · 2026-08-30

## Context

The product needs to capture leads. The handoff pack already specifies
`leadCaptureMode: "qr-first"`. The options were a Next.js API layer with Postgres, posting to an
existing Wealth Club endpoint, or no backend at all.

The operating environment is the deciding factor: an unattended machine in an exhibition hall
with unreliable venue wifi, for eight hours a day, with nobody technical nearby.

## Decision

No backend. Visitors are sent to existing registration URLs via QR codes rendered on-device.
Any lead typed on the screen is buffered in IndexedDB and exported as CSV from the admin
overlay. Analytics counters are local only.

## Consequences

**Positive.** Removes the failure class that actually kills event installations — a database
container that did not start, a migration that did not run, a disk full of logs. The conversion
path works with the network unplugged, because a QR code is just pixels. Personal data never
leaves the booth machine, which removes a category of privacy risk entirely. Deployment is one
container.

**Negative.** No real-time visibility into leads from off-site. CSV export is a manual step
someone must remember to perform before the machine is packed up. No cross-device analytics.

**Mitigation.** The admin overlay shows a live lead count so the omission is visible. The
day-end checklist in `05-kiosk-deployment.md` includes the export. `lib/leads.ts` is written
behind an interface so a POST-to-endpoint transport can be added later without touching the UI.
