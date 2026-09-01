# 0007 — A write-only lead endpoint and a file archive on a volume

**Status:** Accepted · 2026-09-01
**Amends:** [0003 — No backend; QR-first lead capture](0003-no-backend-qr-first.md)

## Context

The collaboration scenes ask a head teacher or an HR manager to start a conversation. Until now
the only way to do that was a QR code: the visitor scans it, leaves, and follows it up later —
or, in practice, does not. A B2B lead is worth an order of magnitude more than a B2C one and
there are only a handful of them per day, so losing them to "I'll do it at the office" is the
single most expensive failure the booth has.

ADR 0003 ruled out a backend and buffered typed leads in IndexedDB. That storage is the
problem, not the absence of a server: IndexedDB lives in one browser profile on one machine. A
cleared profile, a Chrome update, a reimaged mini-PC or a kiosk relaunched in a fresh profile
loses every lead silently, and nobody discovers it until they go looking for the export that
was never taken.

The options were: keep IndexedDB and add a nagging export reminder; POST to an existing Wealth
Club endpoint; or store on the machine, outside the browser.

## Decision

Add one write-only API route, `POST /api/leads`, and store each submission as a JSON file in a
directory that is a **named Docker volume** in production.

Reading the archive is a separate, token-guarded surface: a `/leads` page and
`/api/leads/archive` routes that list, download (PDF or CSV) and delete. The token is the whole
credential and lives in `.env.secrets`; nothing in the kiosk UI links to it.

Everything else in ADR 0003 stands. There is still no database, no migration, no second
container, and no outbound request: the network can stay unplugged all day and the form still
works, because the machine writing the file is the machine serving the page.

## Consequences

**Positive.** A lead survives a browser profile reset, a container rebuild, an image rollback
and a `docker compose down`, which is the entire point. The archive is recoverable by a
non-developer with a file manager and a `tar` command. One JSON file per lead means a
half-written file during a power cut costs one lead, not the day. The PDF is generated on
demand from those files, so a change to the layout re-renders the whole history rather than
leaving the archive in two designs.

**Negative.** The app now writes to disk, so it has a failure mode it did not have — a full or
unwritable volume. It also now holds personal data at rest on the booth machine, which is a
retention question somebody has to answer; the delete buttons exist so the answer can be
"cleared at the end of the festival". And the read surface is guarded by a shared secret in a
URL, which is weaker than a login.

**Mitigation.** `POST /api/leads` answers 500 without detail and logs the cause; the archive
page's count is how an operator notices nothing is arriving. An unset `LEADS_ACCESS_TOKEN`
closes the archive rather than opening it, so a deployment that forgot to set one fails safe.
The token is not in a QR code, not in the client bundle, and the `/leads` page 404s without it
rather than admitting it exists.

**Rejected: POST to an existing Wealth Club endpoint.** It reintroduces the dependency on venue
wifi that ADR 0003 removed, and turns a hall-wide network drop into lost leads instead of a
slower day.
