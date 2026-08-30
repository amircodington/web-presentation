# 03 — Git Workflow (Trunk-Based)

## The model

`main` is the trunk. It is always in a releasable state. Work happens on short-lived branches
that merge back quickly.

```text
main ────●────────●────────●────────●────────●──────▶
          \      /          \      /          \
           ●────●            ●────●            ●───▶
        feat/camera       feat/quiz        fix/idle
```

**Never commit directly to `main`.** Not for a typo, not for a "quick" fix. The branch costs
ten seconds and it is what makes the history reviewable.

## Branch naming

```text
feat/<slug>      new capability          feat/camera-engine
fix/<slug>       bug fix                 fix/idle-timer-leak
docs/<slug>      documentation only      docs/project-foundation
chore/<slug>     tooling, deps, config   chore/docker-compose
refactor/<slug>  no behaviour change     refactor/scene-registry
perf/<slug>      performance             perf/video-preload
```

Slugs are kebab-case and describe the *outcome*, not the activity. `feat/camera-engine`, not
`feat/working-on-camera`.

## Reuse a branch, or open a new one?

Both are correct in different cases, and the distinction is worth being explicit about:

- **Reuse the existing branch** when the new work is part of the same feature and would not be
  meaningfully mergeable on its own — follow-up commits, review fixes, an obviously-missing
  piece of the same slice.
- **Open a new branch off `main`** when the work is independently mergeable and independently
  valuable. Stacking unrelated work onto an open branch is how a one-day branch becomes a
  one-week branch.

If in doubt: could this merge to `main` today on its own and leave the product working? If yes,
it is its own branch.

## Lifecycle

```bash
git checkout main && git pull                # 1. start from current trunk
git checkout -b feat/camera-engine           # 2. branch

# ... small, focused commits ...

git fetch origin && git rebase origin/main   # 3. rebase before merging
npm run lint && npm run typecheck && npm run test   # 4. verify

git checkout main
git merge --no-ff feat/camera-engine         # 5. merge with a merge commit
git branch -d feat/camera-engine             # 6. delete
```

**Rebase the branch, merge the trunk.** Rebasing keeps the branch's own history linear and free
of noise merges; `--no-ff` on the way in preserves the fact that a group of commits was one
feature. Rebasing anything already merged into `main` is forbidden.

**Branches are short-lived — target under one day.** A branch that outlives that is a task that
was scoped too large; split it. Long branches are where merge conflicts and stale assumptions
come from.

## Commit messages

Conventional Commits, because `npm run release` parses them (see
[02-versioning-and-releases.md](02-versioning-and-releases.md)).

```text
<type>(<scope>): <subject>

<optional body — the WHY, not the what>

<optional footer — BREAKING CHANGE: …>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.
Scopes: `engine`, `quiz`, `content`, `lead`, `kiosk`, `ui`, `media`, `docker`, `ops`, `docs`.

```text
feat(engine): add dive transition for cross-canvas jumps
fix(kiosk): clear quiz answers on idle reset

Session state persisted across resets, so a second visitor could see the
first visitor's answers. Reset now clears the whole store rather than
resetting the current scene alone.

feat(content)!: rename priceRegular to price

BREAKING CHANGE: all content JSON must be updated.
```

Subject in the imperative mood, lower case, no trailing period, under 72 characters. The body
exists for *why*; git already knows what changed.

## Commit granularity

One logical change per commit. A commit that adds a feature and reformats forty files is
unreviewable and unrevertable. If you cannot describe a commit in one line without "and", it is
two commits.

## What must be true before merging

- [ ] `npm run lint`, `npm run typecheck`, `npm run test` all pass
- [ ] Content validates against the schemas
- [ ] Rebased on current `main`
- [ ] Verified in a browser at kiosk resolution
- [ ] `AGENTS.md` / `docs/` updated if a convention changed
- [ ] No narration or bug-fix comments introduced (`AGENTS.md` §3)

## Tags

Only `npm run release` creates tags, only on `main`, always `v<APP_VERSION>` matching `.env`.
Never tag by hand — a tag that disagrees with `.env` breaks the rollback procedure, which is
the one thing that has to work under pressure.
