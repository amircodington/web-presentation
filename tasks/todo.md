# Tasks

One branch per task. Sizes: XS 1 file · S 1–2 · M 3–5 · L 5–8. Nothing above L ships as one task.

Every task additionally inherits the Definition of Done in [`AGENTS.md`](../AGENTS.md) §9.

---

## Phase 0 — Foundation

### - [ ] Task 1 · Next.js scaffold
`chore/scaffold` · M · deps: none
Next.js App Router + TypeScript strict + Tailwind. RTL root layout. ESLint with the
physical-CSS-property ban and the no-narration-comment rule. Vitest + Playwright configured.
- [ ] `npm run dev` serves a page with `<html lang="fa" dir="rtl">`
- [ ] `lint`, `typecheck`, `test` scripts exist and pass
- [ ] Lint fails on `ml-4` and passes on `ms-4`

### - [ ] Task 2 · `.env` and typed config
`chore/env-config` · S · deps: 1
`.env`, `.env.example`, `src/config/kiosk.config.ts` parsing into a frozen typed object.
- [ ] Every key in `docs/operations/02-versioning-and-releases.md` present in both files
- [ ] Config throws at startup on a missing or unparseable key
- [ ] No `process.env` reference outside `kiosk.config.ts`

### - [ ] Task 3 · Docker dev and prod
`chore/docker` · M · deps: 2
Multi-stage Dockerfile on `node:22-bookworm-slim`, both compose files, `.dockerignore`.
- [ ] `docker compose up` hot-reloads on a source edit
- [ ] `node_modules` is a named volume, not a bind mount
- [ ] Prod image runs standalone output as non-root and passes `/api/health`
- [ ] Neither compose file contains a literal version, port, or tag

### - [ ] Task 4 · Design tokens and fonts
`feat/design-tokens` · M · deps: 1 · **blocked on client brand assets**
Self-hosted subset Persian fonts, CSS custom properties from `brand.json`, the timing scale and
type scale from `docs/architecture/05-motion-and-visual-design.md`.
- [ ] No external font request in the network tab
- [ ] Type scale renders correctly at 1920×1080
- [ ] Persian digits render via the formatter, not a font swap

### - [ ] Task 5 · Release tooling and CI
`chore/release-tooling` · M · deps: 2
`scripts/release.ts`, commit linting, both changelog files seeded, CI running lint + typecheck +
test + content validation + bundle budget.
- [ ] `npm run release -- --dry-run` reports the correct derived bump
- [ ] Release refuses on a dirty tree, on a non-`main` branch, and on an empty user changelog
- [ ] `.env`, `package.json`, git tag and Docker tag all agree after a dry run
- [ ] Pre-commit hook blocks credential-shaped strings in `.env`

### Checkpoint A
- [ ] `docker compose up` and `-f docker-compose.prod.yml up` both work from a clean clone
- [ ] CI green
- [ ] Prod container survives the network being unplugged

---

## Phase 1 — Content

### - [ ] Task 6 · Content schemas
`feat/content-schemas` · L · deps: 1
A Zod schema per file in `content/`, per `docs/architecture/04-content-model.md`.
- [ ] Types inferred from schemas, never hand-written
- [ ] Cross-reference checks: recommended ids exist; result bands cover the score range with no
      gap or overlap; `next`/`back` scene references resolve
- [ ] Fixture tests cover valid and invalid cases per schema

### - [ ] Task 7 · Loader, selectors, validation script
`feat/content-loader` · M · deps: 6
`content/load.ts` (validate, freeze, last-known-good fallback), `content/select.ts`,
`scripts/validate-content.ts` wired into build, CI, and pre-commit.
- [ ] A malformed content file fails the build with a readable error naming file and key
- [ ] Runtime load falls back to last-known-good rather than crashing
- [ ] `priceFor()` honours the festival toggle in both directions

### Checkpoint B
- [ ] Every real content file validates
- [ ] Deliberately breaking one JSON file fails the build with a useful message

---

## Phase 2 — Engine

### - [ ] Task 8 · Projection maths
`feat/engine-projection` · S · deps: 1
Pure `projection.ts`. **The riskiest code in the project — it lands first and alone.**
- [ ] Identity, translation, scale, rotation and composition-order cases covered
- [ ] Property test: `project()` always centres the scene in the viewport
- [ ] Zero imports outside `engine/`

### - [ ] Task 9 · Camera, Scene, SceneGraph
`feat/engine-camera` · M · deps: 8, 7
The transforming node, scene positioning, graph rendered from `scenes.json`.
- [ ] Camera moves between two scenes at 60fps
- [ ] Only `transform` and `opacity` animate — verified in a performance trace
- [ ] `engine/` imports nothing from `content/`, `components/scenes/`, or `store/`

### - [ ] Task 10 · Transitions
`feat/engine-transitions` · M · deps: 9
All six presets. `dive` as a three-keyframe GSAP timeline with the zoom-out apex.
- [ ] Each preset selectable from `scenes.json`
- [ ] A long jump using `dive` reads as legible, not as a glitch
- [ ] Mid-flight retarget continues from the current position with preserved velocity

### - [ ] Task 11 · Gestures
`feat/engine-gestures` · M · deps: 9
Pointer Events: swipe, pinch, two-finger pan, double-tap re-centre, idle re-centre.
- [ ] Zoom clamped to `ENGINE_MIN_ZOOM`/`MAX_ZOOM`; pan clamped to canvas bounds + 20%
- [ ] Free pan or zoom eases back after `KIOSK_GESTURE_RECENTER_MS`
- [ ] Browser pinch-zoom, double-tap-zoom, long-press menu and overscroll-back all suppressed

### - [ ] Task 12 · Scene lifecycle
`feat/engine-lifecycle` · M · deps: 10
`active` / `near` / `far` states; entrance timeline factories played on activation.
- [ ] Non-active scenes have media paused and `pointer-events: none`
- [ ] Frame rate holds with three video scenes on the canvas
- [ ] Entrance timeline reverses cleanly on deactivation

### Checkpoint C
- [ ] Three placeholder scenes navigable by touch and gesture at 60fps
- [ ] Rapid repeated tapping never leaves the camera stranded
- [ ] **Demo to the user before building product scenes on top**

---

## Phase 3 — Journey

### - [ ] Task 13 · Attract scene
`feat/scene-attract` · M · deps: 12, 4
Full-bleed ambient media, hero line, pulsing touch cue, camera `drift`.
- [ ] Legible and visibly moving from ten metres
- [ ] No static frame longer than 20 seconds
- [ ] First paint under 1.5s on kiosk hardware

### - [ ] Task 14 · Home hub
`feat/scene-home` · M · deps: 13
The hub every path returns to. Audience entry points.
- [ ] Reachable from every scene in at most two taps
- [ ] Exactly one accent-coloured call to action

### - [ ] Task 15 · Audience scenes
`feat/scene-audience` · M · deps: 14, 7
Six segments from `audiences.json`, laid out as a canvas cluster.
- [ ] Adding a seventh audience needs only a JSON edit
- [ ] Each routes to correctly filtered products

### - [ ] Task 16 · Course and workshop scenes
`feat/scene-products` · L · deps: 15
Cards, pricing with the offer overlay, dates in Jalali, capacity badge.
- [ ] Festival toggle switches pricing cleanly in both directions
- [ ] Inactive items never render
- [ ] Missing optional fields degrade to a designed state, never a blank

### Checkpoint D
- [ ] Attract → home → audience → course walkable on real touch hardware
- [ ] **Client review of content and copy**

---

## Phase 4 — Quiz

### - [ ] Task 17 · Scoring and recommendation
`feat/quiz-logic` · M · deps: 6
Pure functions in `lib/`, per the handoff pack's quiz logic.
- [ ] No store access, no side effects
- [ ] Every result band reachable, verified by exhaustive test
- [ ] Recommendations always resolve to active products

### - [ ] Task 18 · Quiz scenes
`feat/quiz-scenes` · L · deps: 17, 12
Question scenes using `snap`, progress rail, back navigation.
- [ ] Response to a tap under 100ms
- [ ] Back preserves prior answers; reset clears them
- [ ] Adding a question is a JSON edit only

### - [ ] Task 19 · Result reveal
`feat/quiz-result` · M · deps: 18
`rise` transition, result copy, recommended products.
- [ ] Reveal is dramatic but under 1.5s
- [ ] Result carries into the QR and lead scenes

### Checkpoint E
- [ ] Full quiz path completes and recommends sensibly for every segment
- [ ] Abandoning mid-quiz and returning gives the next visitor a clean start

---

## Phase 5 — Conversion

### - [ ] Task 20 · QR panel
`feat/qr-panel` · M · deps: 19, 7 · **blocked on client URLs**
On-device QR rendering, contextual per product and per result.
- [ ] Renders with the network unplugged
- [ ] Scannable from one metre on the real screen
- [ ] Auto-returns after `KIOSK_QR_RESET_MS`

### - [ ] Task 21 · Lead form and success
`feat/lead-capture` · L · deps: 20
IndexedDB buffer, Persian validation messages, success scene.
- [ ] Submission works offline
- [ ] Validation messages are Persian and specific
- [ ] Success auto-returns after `KIOSK_SUCCESS_RESET_MS`
- [ ] Transport sits behind an interface (ADR 0003 mitigation)

### - [ ] Task 22 · Idle reset
`feat/idle-reset` · M · deps: 21
Inactivity detection, full session wipe, camera returns to the attract scene.
- [ ] No answer, field value, or scroll position survives a reset
- [ ] Pointer, touch and keyboard activity all count as interaction
- [ ] E2E test asserts a clean state after timeout

### - [ ] Task 23 · Admin overlay
`feat/admin-overlay` · M · deps: 22
Five-tap corner gesture: version, lead count, CSV export, content reload, force reset.
- [ ] Not discoverable by accident
- [ ] Shows `APP_VERSION` from the build
- [ ] CSV export opens correctly in Excel with Persian text (UTF-8 BOM)

### Checkpoint F
- [ ] Complete journey through to conversion, offline, on real hardware
- [ ] Leads export correctly

---

## Phase 6 — Polish and release

### - [ ] Task 24 · Media integration
`feat/media` · M · deps: 23 · **blocked on client assets**
Real video and photography, Ken Burns with focal points, encoding to budget.
- [ ] Every video ≤ 8 MB with a poster
- [ ] Only the active scene decodes video

### - [ ] Task 25 · Motion refinement
`feat/motion-polish` · M · deps: 24
Timing pass across every transition and entrance against the motion principles.
- [ ] No camera move over 1.5s
- [ ] Touch feedback under 100ms everywhere
- [ ] `prefers-reduced-motion` path verified

### - [ ] Task 26 · Performance
`perf/budget` · M · deps: 25
Meet every number in the overview's budget table.
- [ ] JS under 300 KB gzipped
- [ ] Dropped frames under 5% across all transitions
- [ ] Budgets enforced in CI

### - [ ] Task 27 · E2E and visual regression
`test/e2e` · M · deps: 26
Playwright: full journey, idle reset, offline; visual snapshot per scene.
- [ ] Suite passes headless in CI
- [ ] Snapshots catch RTL and layout regressions

### - [ ] Task 28 · Deployment rehearsal and v1.0.0
`chore/release-1.0.0` · M · deps: 27
Execute the day-before rehearsal in `docs/operations/05-kiosk-deployment.md` on real hardware,
then release.
- [ ] All nine rehearsal steps pass
- [ ] Autostart survives a cold boot and a power cut, unattended
- [ ] `npm run release -- --major` produces v1.0.0 with both changelogs
- [ ] Rollback to the previous tag verified without a network

### Checkpoint G — ready for the festival
- [ ] Runs unattended for eight hours with no intervention
- [ ] Recovery card printed and taped inside the booth
