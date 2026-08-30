# 01 — Architecture Overview

## The shape of the problem

An unattended touchscreen TV in a noisy exhibition hall. The app has roughly **three seconds**
to stop someone walking past, and roughly **ninety seconds** to turn them into a lead before
they wander off. Whatever we build must be visually arresting at ten metres, obvious to touch
at one metre, and completely indifferent to whether the venue's wifi is alive.

That produces four hard constraints, and every decision below falls out of one of them:

1. **Spectacle** — motion is the product, not decoration.
2. **Immediacy** — no loading spinners, no network round-trips in the interaction path.
3. **Reliability** — an unattended machine that must survive eight hours a day, unsupervised.
4. **Editability** — the client will change prices, dates, and copy the night before, and
   possibly at the booth. That must not require a developer.

## The stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Standalone output builds into a self-contained Node server that runs offline in Docker. Strong typing over content that changes late. |
| Styling | **Tailwind CSS** | Logical properties give correct RTL for free. Utility classes keep animated elements free of cascade surprises. |
| UI motion | **Motion** (`motion/react`) | Declarative enter/exit and layout animation, `AnimatePresence` for scene transitions. Tree-shakes to ~5 KB with `LazyMotion`. |
| Choreography | **GSAP** | Timelines for multi-element scene entrances that need precise sequencing. Free including all plugins since 2025. |
| Zoom engine | **Custom camera layer** | See below. |
| Content | **JSON + Zod** | Non-developers edit JSON; Zod fails the build loudly on a typo rather than shipping a blank price. |
| Persistence | **IndexedDB** | Lead buffer and analytics counters survive a page reload and a power cycle. |
| State | **Zustand** | The kiosk session is one small store that must be wipeable in one call on idle reset. |
| QR | **`qrcode`** (local render) | Generated on-device. A QR fetched from an API is a QR that fails when the wifi does. |
| Runtime | **Docker**, `node:22-bookworm-slim` | Already present on this machine. |

## The central decision: how the Prezi effect is built

Three options were on the table.

**impress.js** is the original "Prezi in HTML/CSS" and genuinely does zoom, rotate and pan out
of the box. It is also HTML-only authoring, built around global DOM mutation and a
`data-`attribute API, and its maintenance has gone quiet. Wiring it to React means either
giving up React for the canvas or fighting reconciliation on every transition. Rejected.

**reveal.js** is the most mature and best-maintained framework in this space, but it is a
linear two-axis deck. It has no true zooming interface, and its motion ceiling is fragments
plus Auto-Animate. It would deliver a slideshow when the brief explicitly says the screen must
not be a slideshow. Rejected.

**A custom camera layer** — chosen. The entire Prezi effect reduces to one idea: absolutely
position every scene in a shared coordinate space, then animate a single wrapping element's
`transform` so that the target scene fills the viewport.

```
viewport (overflow hidden, fixed 1920×1080 design space)
└── canvas   ← the ONE element that transforms
    ├── scene "attract"   at x:0     y:0     scale:1
    ├── scene "home"      at x:2400  y:0     scale:1
    ├── scene "quiz-q1"   at x:2400  y:1600  scale:1.4
    └── scene "course-18" at x:5200  y:-900  rotate:-6
```

Moving the camera to a scene is the inverse of that scene's own transform. One `translate`,
one `scale`, one `rotate` on one node — which the compositor handles on the GPU, so it holds
60fps on modest kiosk hardware where animating many elements would not.

The cost is roughly 200 lines we own. The return is complete control over easing, gesture
handling, RTL correctness and interruption behaviour, with no dependency that can go stale
before the festival. Recorded as [ADR 0001](adr/0001-custom-camera-over-impress-js.md).

## Why there is no backend

The handoff pack already specifies `leadCaptureMode: "qr-first"`. Visitors are sent to existing
registration URLs via on-device QR codes, so the conversion path never touches our
infrastructure. Any lead typed directly on the screen is written to IndexedDB and exported as
CSV from a hidden admin overlay.

This removes the entire class of failures that actually kills event installations — a database
container that did not come up, a migration that did not run, a disk that filled with logs. It
also removes GDPR-shaped risk: personal data never leaves the machine at the booth.
Recorded as [ADR 0003](adr/0003-no-backend-qr-first.md).

## Rendering strategy

Everything is a **client component below a single static shell**. There is no per-request
server rendering — the content is baked in at build time and the whole experience is one
long-lived client session. `output: "standalone"` is used so production is a single Node
process with no `node_modules` to install at the booth.

## RTL

`fa-IR` is the only locale, `dir="rtl"` is set on `<html>`, and Tailwind logical properties
(`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) are mandatory. Physical properties are
lint-banned.

One subtlety the camera makes important: **RTL flips text and layout, but not the canvas
coordinate space.** Scene positions are authored in a plain left-handed maths space, and the
camera never mirrors. Mirroring the canvas would mirror the type inside it. Scenes are
therefore laid out right-to-left *conceptually* by choosing negative X for "next", which keeps
the camera maths trivial and the text upright.

## Performance budget

| Metric | Budget |
|---|---|
| Time to first paint of the attract scene | < 1.5s on kiosk hardware |
| Scene transition frame rate | 60fps, no dropped frames over 5% |
| Interaction to visual response | < 100ms |
| Total JS shipped | < 300 KB gzipped |
| Longest video asset | < 8 MB, `h.264`, muted, looped |

Enforced in CI by a bundle-size check and a Playwright trace assertion.
