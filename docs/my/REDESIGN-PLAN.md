# Redesign Plan — Master Brief Implementation

Execution plan for [`WEALTH-CLUB-KIOSK-MASTER-REDESIGN-BRIEF.md`](WEALTH-CLUB-KIOSK-MASTER-REDESIGN-BRIEF.md),
which supersedes every earlier change request in this folder.

One task per branch, per [AGENTS.md §4](../../AGENTS.md#4-git-workflow--trunk-based) and §12.
Every task ends `branch → merge --no-ff → npm run release`, per §10.

## What changes structurally

The kiosk stops being *attract → pick one of seven audiences → catalogue → quiz*. It becomes
*attract → pick one of three worlds → play inside that world → result → product reveal*.

The seven audiences in `audiences.json` were a segmentation for a catalogue. The brief replaces
the **first interactive decision** with three age groups, each of which owns its own palette,
motion density, tone, sound personality and four experiences. School and organisation survive as
a secondary CTA below the gateway, not as peers of the three groups.

## Tasks

| # | Branch | Scope | Brief sections |
|---|---|---|---|
| 0 | `docs/redesign-branch-registry` | This plan, plus the branch registry rule in AGENTS.md §12 | — |
| 1 | `feat/audience-worlds` | `kids`/`teens`/`adults` model, Audience Gateway, three world design systems, B2B secondary route, scene graph restructure, idle reset over the new state | 3, 7–10, 62–64 |
| 2 | `feat/attract-worlds` | Animated attract loop: three portals, the coin→piggy→chart→dashboard morph, «تو کدوم دنیایی؟» | 4–6 |
| 3 | `feat/audio-manager` | Central audio manager, per-world volumes, debounce and concurrency caps, mute control, subtitles | 49–56 |
| 4 | `feat/kids-world` | Kids home + four experiences + mandatory celebration + kids course reveal | 14–23 |
| 5 | `feat/teens-world` | Teen home + four experiences + animated score and level-up + مسیر ثروت / Business School | 24–32, 47–48 |
| 6 | `feat/adults-world` | Adult home + four experiences + config-based question bank + multi-dimensional profile + کنکور → +18 | 33–45 |
| 7 | `chore/production-image` | Full UI verification, production image, local production deployment | 67–68, 75 |

## Ordering rationale

Task 1 lands first because every later task hangs off the world model: building a kids game
before the kids world exists means writing the wiring twice. Audio (task 3) precedes the three
world tasks because each world declares a sound personality, and retrofitting a sound layer into
twelve finished experiences is the most expensive possible ordering.

The three world tasks are independent of one another and could be built in any order; they run
kids → teens → adults because the kids world exercises the most new primitives (drag targets,
celebration, voice) and any problem with those is cheapest to find first.

## Acceptance

The checklist in brief §75 is the acceptance gate. Task 7 walks it end to end in a browser at
1920×1080 before the production image is built.
