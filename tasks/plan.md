# Implementation Plan — Wealth Club Kiosk

## Overview

A Persian RTL full-screen kiosk web app for a touchscreen TV at the Baghe Ketab festival.
Navigation is a Prezi-style camera panning and zooming across one canvas of scenes. No backend;
QR-first conversion; all content in validated JSON.

Full reasoning in [`docs/architecture/01-overview.md`](../docs/architecture/01-overview.md).
Rules in [`AGENTS.md`](../AGENTS.md).

## Architecture decisions

- **Custom camera layer**, not impress.js or reveal.js — [ADR 0001](../docs/architecture/adr/0001-custom-camera-over-impress-js.md)
- **JSON + Zod content**, no CMS — [ADR 0002](../docs/architecture/adr/0002-json-content-with-zod.md)
- **No backend, QR-first** — [ADR 0003](../docs/architecture/adr/0003-no-backend-qr-first.md)
- **Committed `.env` as version SSOT** — [ADR 0004](../docs/architecture/adr/0004-env-as-single-source-of-truth.md)

## Sequencing rationale

The engine is the highest-risk part of the build and everything visual depends on it, so it
lands in phase 2 — early enough to fail fast while there is still time to fall back to a
simpler transition model. Content plumbing precedes it because scenes are data-driven and
building the engine against hardcoded fixtures would mean writing the integration twice.

Phases 3–5 are vertical slices: each one delivers a complete, demonstrable path through the
product rather than a horizontal layer. After phase 3 there is a walkable journey to show the
client, which is when content and copy feedback starts arriving and is cheapest to absorb.

## Task list

Tasks and checkpoints: [`todo.md`](todo.md). One branch per task, per
[`docs/operations/03-git-workflow.md`](../docs/operations/03-git-workflow.md).

| Phase | Delivers |
|---|---|
| 0 · Foundation | Repo scaffold, Docker, `.env`, release tooling, CI |
| 1 · Content | Schemas, loader, validation, real content files |
| 2 · Engine | Camera, scene graph, transitions, gestures, lifecycle |
| 3 · Journey | Attract → home → audience → course. A walkable demo |
| 4 · Quiz | Questions, scoring, recommendation, result reveal |
| 5 · Conversion | QR panel, lead form, success, idle reset, admin overlay |
| 6 · Polish | Motion refinement, media, performance, E2E, v1.0.0 |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Camera interruption during rapid tapping feels broken | High | Motion's interruptible controls; retarget from current interpolated position. Prototype in Task 8 before building on it |
| Frame rate drops with multiple videos on canvas | High | Scene lifecycle states pause non-active media; Playwright trace budget in CI |
| Content arrives late or incomplete from the client | High | Schemas allow optional fields with designed empty states; ship with placeholders that are visibly placeholders, never blank |
| Persian font rendering and digit shaping wrong at display size | Medium | Self-hosted subset fonts; visual snapshot per scene from phase 1 |
| Touch calibration differs from the dev machine | Medium | Test on real hardware from phase 3, not at the end |
| RTL layout breaks under camera rotation | Medium | Camera never mirrors; lint bans physical CSS properties |
| Venue power cut mid-session | Low | `restart: unless-stopped`; power-cycle test in the rehearsal |

## Open questions for the client

These block specific tasks and are worth chasing early — each one has a task that cannot finish
without it.

1. Brand colours, logo, and licensed font files (blocks Task 4)
2. Final course list with real prices, both regular and festival (blocks Task 6)
3. Workshop schedule with dates and capacities (blocks Task 6)
4. Registration URLs for every QR destination (blocks Task 20)
5. Video and photography assets, or budget to source them (blocks Task 24)
6. Exact TV resolution and orientation (blocks Task 2 — it sets the design space)
7. Whether an on-screen keyboard is needed for the lead form (blocks Task 21)
