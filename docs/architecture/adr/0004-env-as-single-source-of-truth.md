# 0004 — Committed root `.env` as the version single source of truth

**Status:** Accepted · 2026-08-30

## Context

A version number that exists in several places will eventually disagree with itself. The
`package.json` says one thing, the Docker tag another, the git tag a third, and the screen at
the booth a fourth — and the rollback procedure, which has to work under pressure, becomes
guesswork.

## Decision

The root `.env` is the single source of truth for `APP_VERSION` and every deployment tunable.
It is **committed to git**. `npm run release` is the only thing that writes `APP_VERSION`, and
it propagates that one value to `package.json`, the git tag, the Docker image tag, both
changelog headings, and the version shown in the admin overlay. Secrets live in the git-ignored
`.env.secrets`.

## Consequences

**Positive.** Version drift becomes structurally impossible. Rollback at the booth is one
variable — `APP_VERSION=1.1.0 docker compose -f docker-compose.prod.yml up -d` — with no
rebuild and no network. Every tunable is reviewable in a diff and identical for everyone.

**Negative.** Committing a `.env` runs against the usual convention and will look wrong to
anyone who has not read this ADR. It creates a real risk that someone adds a secret to it out of
habit.

**Mitigation.** The file header states that it contains no secrets. `.env.secrets` exists and is
git-ignored so there is an obvious correct place for one. A pre-commit hook scans `.env` for
patterns that look like credentials and blocks the commit.
