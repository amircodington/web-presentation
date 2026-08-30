# 02 — Versioning and Releases

## The principle

**The root `.env` is the single source of truth.** One file holds every version and every
tunable. Nothing else is allowed to define its own copy — not `package.json`, not a Dockerfile,
not a compose file, not a constant in a component.

`.env` **is committed to git.** This is deliberate and it is the opposite of the usual advice,
so it needs justifying: this file contains no secrets. It contains the version, ports, image
names, and behavioural tunables — all of which must be identical for everyone and must be
reviewable in a diff. A version that lives in an uncommitted file is a version nobody can
verify.

Secrets, if any ever appear, go in `.env.secrets`, which is git-ignored and loaded on top.

## `.env` layout

```bash
# ─── Version ─────────────────────────────────────────────
# Managed by `npm run release`. Never hand-edit.
APP_VERSION=0.1.0
APP_NAME=wealth-club-kiosk
APP_BUILD_DATE=

# ─── Docker ──────────────────────────────────────────────
DOCKER_IMAGE=wealth-club/kiosk
DOCKER_REGISTRY=
DEV_PORT=3000
PROD_PORT=8080
NODE_VERSION=22-bookworm-slim

# ─── Kiosk behaviour ─────────────────────────────────────
KIOSK_IDLE_TIMEOUT_MS=75000
KIOSK_SUCCESS_RESET_MS=9000
KIOSK_QR_RESET_MS=25000
KIOSK_GESTURE_RECENTER_MS=6000
KIOSK_FESTIVAL_OFFER_ENABLED=true
KIOSK_LEAD_CAPTURE_MODE=qr-first

# ─── Presentation engine ─────────────────────────────────
ENGINE_DESIGN_WIDTH=1920
ENGINE_DESIGN_HEIGHT=1080
ENGINE_MIN_ZOOM=0.4
ENGINE_MAX_ZOOM=2.5
ENGINE_DEFAULT_TRANSITION=glide

# ─── Feature flags ───────────────────────────────────────
FEATURE_QUIZ_ENABLED=true
FEATURE_LEAD_FORM_ENABLED=true
FEATURE_ADMIN_OVERLAY_ENABLED=true
```

`.env.example` mirrors every key with a safe default and a comment. Adding a key to one without
the other is an incomplete change.

Values reach the app through `src/config/kiosk.config.ts`, which parses and freezes them into a
typed object. **Components never read `process.env`.** One typed object, one place to look.

## Semantic versioning, for a kiosk

`MAJOR.MINOR.PATCH`, interpreted against what a booth operator would notice:

| Bump | Meaning here | Example |
|---|---|---|
| **MAJOR** | The journey changed. Operator retraining, or content that must be re-authored | Scene graph restructured; content schema breaking change |
| **MINOR** | New capability, backward compatible | A new scene, the quiz, an admin export |
| **PATCH** | Fix or polish, nothing new to learn | Timing correction, copy fix, layout bug |

Pre-festival builds are `0.x.y`. The build that goes on the TV on day one is `1.0.0`.

## Commits drive the bump

Conventional Commits are not cosmetic — `npm run release` parses them.

| Commit | Bump |
|---|---|
| `fix:` / `perf:` | PATCH |
| `feat:` | MINOR |
| `BREAKING CHANGE:` in footer, or `feat!:` | MAJOR |
| `docs:` / `chore:` / `refactor:` / `test:` / `style:` | none |

## The release command

```bash
npm run release            # bump derived from commits
npm run release -- --minor # force a level
npm run release -- --dry-run
```

`scripts/release.ts` does, in this order:

1. Refuses to run on a dirty tree, or on any branch but `main`.
2. Reads commits since the last `v*` tag and derives the bump.
3. Writes `APP_VERSION` and `APP_BUILD_DATE` in `.env`.
4. Syncs `package.json` version from `.env` — one direction only, `.env` is authoritative.
5. Regenerates `CHANGELOG.md` from the commits.
6. **Pauses and prompts for the Persian `CHANGELOG-USER.md` entry**, opening `$EDITOR`.
   Refuses to continue if the entry is left empty. See [04-changelogs.md](04-changelogs.md).
7. Commits as `chore(release): v<version>`.
8. Tags `v<version>` with the technical changelog section as the annotation.
9. Builds and tags the Docker image `${DOCKER_IMAGE}:<version>` and `:latest`.

Steps 3, 7, 8 and 9 all read the same value, which is the entire point: the git tag, the Docker
tag, the `package.json`, and the version on screen cannot drift apart.

Step 6 pausing for human input is deliberate friction. An auto-generated user changelog is
just the technical one with the prefixes stripped, which is worse than none.

## Rollback

Every release is a tagged, immutable image. Rolling back at the booth is:

```bash
APP_VERSION=1.2.0 docker compose -f docker-compose.prod.yml up -d
```

No rebuild, no network. This is why the image tag comes from `.env` rather than being pinned
inside the compose file — under pressure, at a booth, changing one line in one file is the
only recovery procedure anyone will execute correctly.
