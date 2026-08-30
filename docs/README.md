# Documentation Index

Everything about *how this is built* lives here. Product truth lives in the handoff pack.

## Read in this order

| # | Document | What it answers |
|---|---|---|
| 0 | [`../AGENTS.md`](../AGENTS.md) | The rules. Read first, always. |
| 1 | [`architecture/01-overview.md`](architecture/01-overview.md) | What we chose, and why we rejected the alternatives |
| 2 | [`architecture/02-code-structure.md`](architecture/02-code-structure.md) | Where every file goes |
| 3 | [`architecture/03-presentation-engine.md`](architecture/03-presentation-engine.md) | How the Prezi-style camera works |
| 4 | [`architecture/04-content-model.md`](architecture/04-content-model.md) | The JSON schemas that make everything dynamic |
| 5 | [`architecture/05-motion-and-visual-design.md`](architecture/05-motion-and-visual-design.md) | Animation language, video, imagery |
| 6 | [`operations/01-docker.md`](operations/01-docker.md) | Dev and prod containers |
| 7 | [`operations/02-versioning-and-releases.md`](operations/02-versioning-and-releases.md) | `.env` as single source of truth |
| 8 | [`operations/03-git-workflow.md`](operations/03-git-workflow.md) | Trunk-based branching |
| 9 | [`operations/04-changelogs.md`](operations/04-changelogs.md) | The two changelogs |
| 10 | [`operations/05-kiosk-deployment.md`](operations/05-kiosk-deployment.md) | Running it on the TV |

## Product source of truth

| Document | Contents |
|---|---|
| [`wealth-club-kiosk-handoff-pack/01-PRODUCT-BRIEF.md`](wealth-club-kiosk-handoff-pack/01-PRODUCT-BRIEF.md) | Audiences, KPIs, page structure, journey |
| [`wealth-club-kiosk-handoff-pack/02-UI-WIREFRAME.md`](wealth-club-kiosk-handoff-pack/02-UI-WIREFRAME.md) | Screen-by-screen layout |
| [`wealth-club-kiosk-handoff-pack/03-CONTENT-DATA-INPUTS.md`](wealth-club-kiosk-handoff-pack/03-CONTENT-DATA-INPUTS.md) | What the client must supply |
| [`wealth-club-kiosk-handoff-pack/04-QUIZ-LOGIC.md`](wealth-club-kiosk-handoff-pack/04-QUIZ-LOGIC.md) | Scoring and recommendation rules |
| [`wealth-club-kiosk-handoff-pack/05-DEVELOPER-HANDOFF.md`](wealth-club-kiosk-handoff-pack/05-DEVELOPER-HANDOFF.md) | Original implementation checklist |

## Decision records

Architectural decisions that are expensive to reverse live in
[`architecture/adr/`](architecture/adr/). Adding one is how you change a locked decision
in `AGENTS.md` §2.

## Plan

The build order lives in [`../tasks/plan.md`](../tasks/plan.md), tasks in
[`../tasks/todo.md`](../tasks/todo.md).
