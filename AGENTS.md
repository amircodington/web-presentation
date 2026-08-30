# AGENTS.md

Operating rules for any AI agent or developer working in this repository.
Read this file **before** touching anything. It overrides personal habits and generic defaults.

> **Rule 0 — this file is living.**
> Whenever you introduce something an agent must know to work here correctly — a new
> directory, a new script, a new environment variable, a new convention, a new
> architectural boundary — you update `AGENTS.md` **in the same commit** that introduced it.
> A change that makes this file stale is an incomplete change. See §10.

---

## 1. What this project is

A **Persian (fa-IR), RTL, full-screen interactive kiosk web app** for a touchscreen TV at the
Wealth Club booth at the Baghe Ketab festival.

It is *not* a website and *not* a linear slideshow. Navigation is a **Prezi-style camera**
that pans, zooms and rotates across a single infinite canvas of scenes. The product goal is
conversion — stop a passer-by, identify who they are, recommend the right course, hand them a QR.

Authoritative product source: [`docs/wealth-club-kiosk-handoff-pack/`](docs/wealth-club-kiosk-handoff-pack/).
If code and that pack disagree, the pack wins — or you raise it with the user, never silently diverge.

## 2. Locked technical decisions

Do not relitigate these. To change one, write an ADR in `docs/architecture/adr/` and get user sign-off.

| Area | Decision |
|---|---|
| Framework | Next.js (App Router) + TypeScript strict |
| Styling | Tailwind CSS, logical properties only (`ms-`/`me-`, never `ml-`/`mr-`) — except inside `src/engine/`, see §3 |
| Motion | Motion (`motion/react`) for UI enter/exit + layout; GSAP timelines for scene choreography |
| Zoom engine | Custom camera layer (`src/engine/`). **Not** impress.js, **not** reveal.js |
| Content | Typed JSON in `content/`, validated by Zod. No hardcoded copy, prices, or URLs |
| Backend | None. QR-first. Leads buffer in IndexedDB and export as CSV |
| Locale | `fa-IR` only, `dir="rtl"` |
| Runtime | Docker, `node:22-bookworm-slim` base |
| Deployment | Local mini-PC at the booth. Must work with the network unplugged |

Full reasoning: [`docs/architecture/01-overview.md`](docs/architecture/01-overview.md).

## 3. Code style

**Comments.** Document *interfaces*, not *history*.

- ✅ A JSDoc/TSDoc block on an exported function, type, or module explaining what it does,
  its parameters, and its return value.
- ❌ Inline narration (`// loop over the items`), commented-out code, TODO graveyards,
  and above all **change-log comments** — `// fixed bug where…`, `// changed 2026-08-30`,
  `// was previously X`. Git history records history. Code records intent.
- A comment explaining *why* a non-obvious constant or workaround exists is allowed and welcome.
  A comment explaining *what* the next line plainly does is noise — delete it.

**Everything else.**

- TypeScript `strict`. No `any`, no `@ts-ignore`. If you need an escape hatch, ask.
- Never hardcode content, prices, phone numbers, URLs, or Persian copy in components —
  it comes from `content/` through the typed loader.
- Never hardcode tunables (timeouts, durations, easings) in components — they come from
  `src/config/kiosk.config.ts`, which reads `.env`.
- Components are presentational; logic lives in `src/lib/`.
- File names `kebab-case.ts`; React components `PascalCase.tsx`.
- Logical CSS properties everywhere **except `src/engine/`**. The canvas is a maths
  space, not a layout: under RTL, logical insets place its origin at the viewport's
  right edge and silently mirror every scene coordinate. The camera and scene
  wrappers therefore use physical `left`/`top` with an explicit `direction: ltr`,
  and each scene restores `direction: rtl` for its content. Lint enforces this split.

## 4. Git workflow — trunk-based

`main` is the trunk. It is always releasable. **Never commit directly to `main`.**

Every unit of work gets a branch off the latest `main`:

```
feat/<slug>     new capability
fix/<slug>      bug fix
docs/<slug>     documentation only
chore/<slug>    tooling, deps, config
refactor/<slug> no behaviour change
```

Lifecycle: branch from `main` → small commits → rebase on `main` → merge back with
`--no-ff` → delete the branch. Branches are **short-lived** (target < 1 day). If a branch
outlives that, it was too big a task.

Prefer reusing an existing open branch when the work belongs to the same feature;
open a new branch when the work is independently mergeable.

Commits follow **Conventional Commits** — this is not cosmetic, the release tooling parses it:

```
feat(quiz): add age-band scoring
fix(engine): prevent camera drift after rapid double-tap
docs(ops): document kiosk autostart
```

`feat` → minor bump. `fix`/`perf` → patch bump. `BREAKING CHANGE:` in the footer → major bump.

Full rules: [`docs/operations/03-git-workflow.md`](docs/operations/03-git-workflow.md).

## 5. Versioning — `.env` is the single source of truth

The root **`.env` is committed** and is the one place every version and tunable lives.
Nothing — not `package.json`, not a Dockerfile, not a compose file, not a component —
may define its own copy of a value that belongs in `.env`.

`APP_VERSION` in `.env` drives, in lockstep:

- the `package.json` version
- the Docker image tag
- the git tag (`v<APP_VERSION>`)
- both changelog headings
- the version badge rendered in the kiosk's hidden admin overlay

Never hand-edit `APP_VERSION`. Run `npm run release` (see §6).
Secrets never go in `.env`; they go in the git-ignored `.env.secrets`.

Full rules: [`docs/operations/02-versioning-and-releases.md`](docs/operations/02-versioning-and-releases.md).

## 6. Releases and the two changelogs

`npm run release` reads the Conventional Commits since the last tag, derives the bump,
rewrites `.env`, and updates **both** changelogs. Two audiences, two files — keep them separate:

| File | Audience | Language | Content |
|---|---|---|---|
| `CHANGELOG.md` | developers | English | Generated from commits: every change, scoped, with hashes |
| `CHANGELOG-USER.md` | the Wealth Club team | **Persian** | Hand-written per release: what a human notices — "new", "improved", "fixed" |

`CHANGELOG-USER.md` is never auto-generated from commit messages. The release script pauses
and asks for it. Write it in plain Persian, no jargon, no file names, no ticket numbers.

Full rules: [`docs/operations/04-changelogs.md`](docs/operations/04-changelogs.md).

## 7. Docker

Check `docker images` before adding anything. This machine already has
`node:22-bookworm-slim`, `postgres:16-bookworm`, `redis:7-bookworm`, `mysql:8.0`,
`adminer:4.8.1-standalone`, `minio/minio`, `axllent/mailpit:v1.25`. **Reuse those tags.**
Introducing a new base image requires a line in `docs/architecture/adr/` explaining why
an existing one did not fit.

- `docker-compose.yml` — development: bind mounts, hot reload, port 3000.
- `docker-compose.prod.yml` — production: multi-stage build, Next.js standalone output,
  no source mounted, image tagged from `APP_VERSION`.

Both read from `.env`. Neither hardcodes a version, a port, or a tag.

Full rules: [`docs/operations/01-docker.md`](docs/operations/01-docker.md).

## 8. Non-negotiables for the kiosk itself

These come from the physical reality of an unattended screen in a loud hall:

- **Offline-first.** The app must run fully with the network cable pulled. No runtime CDN,
  no external font fetch, no analytics call in the critical path.
- **Idle reset.** No interaction for `KIOSK_IDLE_TIMEOUT_MS` → session cleared, camera returns
  to the attract scene. Session data must never leak between two visitors.
- **Touch targets ≥ 88px.** Fingers, on glass, at standing height. No hover-only affordances.
- **One design size, scaled.** Scenes are authored at `ENGINE_DESIGN_WIDTH` ×
  `ENGINE_DESIGN_HEIGHT` and the stage scales uniformly to the screen, so a laptop and
  the TV show identical frames. Never add breakpoints or percentage layouts to a scene.
- **Interactive elements show a pointer cursor.** The kiosk is touch-only, but the same
  build is driven with a mouse during review and setup.
- **60fps or it does not ship.** Animate `transform` and `opacity` only. Never animate
  `width`, `height`, `top`, or `left`.
- **Respect `prefers-reduced-motion`**, but keep the kiosk's own default expressive.
- **No dead ends.** Every scene has a visible way back to the hub and to the attract loop.
- **Reserve chrome clearance.** Scenes carry `pb-52` so the persistent controls never
  cover content. Scenes must also not overlap on the canvas — both are enforced by
  `npm run validate:content` and a browser measurement pass.
- **B2B and B2G prices are never displayed.** Both source briefs quote per engagement;
  a figure on a public screen undercuts the conversation the booth exists to start.

## 9. Before you say a task is done

- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] `npm run test` passes
- [ ] It was verified in a real browser at 1920×1080 **and** at the target TV resolution
- [ ] No hardcoded content, copy, or tunables introduced
- [ ] No narration or bug-fix comments introduced
- [ ] Content changes still validate against the Zod schemas
- [ ] `AGENTS.md` and the relevant `docs/` page updated if a convention changed (§10)
- [ ] Work is on a branch, commits are Conventional, branch is merged with `--no-ff`

## 10. Keeping this file current

When you add or change any of the following, update the named section here in the same commit:

| You changed… | Update |
|---|---|
| A top-level directory or module boundary | §2, and `docs/architecture/02-code-structure.md` |
| An npm script or tool | §6, §9 |
| An environment variable | §5, and `docs/operations/02-versioning-and-releases.md` |
| A Docker image, service, or compose file | §7, and `docs/operations/01-docker.md` |
| A naming, comment, or style convention | §3 |
| A branch or commit convention | §4, and `docs/operations/03-git-workflow.md` |
| A locked technical decision | §2 + a new ADR in `docs/architecture/adr/` |
| A kiosk hardware or UX constraint | §8 |

Keep it terse. This file is loaded into every agent's context — every sentence costs budget.
Prefer a one-line rule plus a link to the deep doc over a paragraph here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
