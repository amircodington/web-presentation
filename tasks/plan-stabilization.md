# Implementation Plan — Current-Site Stabilization & World Differentiation

> Scope: the voice-feedback punch list in
> [`docs/my/WEALTH-CLUB-CURRENT-SITE-VOICE-FEEDBACK-FIX-LIST.md`](../docs/my/WEALTH-CLUB-CURRENT-SITE-VOICE-FEEDBACK-FIX-LIST.md)
> plus the defects reproduced on the live kiosk at `89.45.89.150:3002` (v0.10.2).
>
> Tasks: [`tasks/todo-stabilization.md`](todo-stabilization.md).
> The original build plan (`tasks/plan.md` / `tasks/todo.md`) is untouched and still open.

## Overview

The kiosk works end to end, but three classes of problem are visible on the live
screen: **scoring that can report a wrong number**, **screens that dead-end or
overflow**, and **three age worlds that are the same screen in three colours**.
This programme fixes the reproduced defects first (they are cheap and they are
the ones a visitor notices), then rebuilds the per-world visual language, then
reworks the game content the feedback called out by name.

## What was reproduced, and why it happens

Every item below was reproduced in a real browser at 1920×1080 against
`localhost:3000`, and the live server was confirmed to run the same build.

| # | Report | Root cause |
|---|---|---|
| **A** | «صفحه اول تکراری است» | `AttractScene` and `GatewayScene` both ask the same question and both show the same three world cards. Two screens, one decision. |
| **B** | بزرگسال — متن از کارت بیرون می‌زند | `WorldHomeScene` puts the experience grid in a `flex-1 min-h-0` row. Adults is the only world carrying *three* extra rows below it (qualifier + reveal + diagnostic), so the row is squeezed and `ExperienceCard` — which has no overflow containment — spills its hook text past the card border. |
| **C** | توضیح «سواد مالی کودک» کامل نیست | `courses.json` defines `kids-financial-literacy`, but `scenes.json` has no `course-kids-financial-literacy` scene. `camera.goTo()` returns silently for an unknown id, so «جزئیات ←» on the kids course card does nothing. The course also has no `logistics`, no price and no `media`, so even the card is thin. |
| **D** | «قلک من» نتیجه‌ای نشان نمی‌دهد | `evaluateAllocation` has a dead zone. With `growthShare ≥ 0.2`, `largest ∈ [0.5, 0.6)` and `used ≥ 3` **no rule fires** — e.g. 5 خرج / 3 پس‌انداز / 2 هدف. `concentrated` needs ≥ 0.6, `balanced` needs < 0.5. The result screen then renders the chart and zero feedback cards. Also hits «چالش ۱۰۰ میلیون» and «سبدت رو بچین». |
| **E** | «راز نوسان قیمت» — ۶ درست، ۵ از ۶ | `MarketGame` and `JudgementGame` hold the score as a counter mutated inside the tap handler, while the choice buttons stay hit-testable through their `AnimatePresence` exit. A repeated or stray touch re-scores the same round. **Reproduced: a 5-round game reported «۱۰ از ۵».** The number is unreliable in both directions. |
| **F** | — (found while testing) | `ProfileGame`'s progress dots render in LTR order inside an RTL scene, so question 1 highlights the last dot. |
| **G** | حذف دکمه «نقشه کامل» | **Already done in v0.10.1.** Verified absent from the code and from both `localhost:3000` and `89.45.89.150:3002`. The button seen was a cached page — a hard reload clears it. No work needed; verify only. |
| **H** | نوار کنترل استایل بهتر | Plain white pill, same on every world, sits on top of scene content on the kids world. |
| **I** | سه دنیا باید متفاوت باشند | All three run `WorldHomeScene` with the same layout and the same cartoon `Mascot` set (smiley piggy / rocket / coin / plant). Adults and teens are wearing kids' artwork. Icons repeat within one screen. The photography in `public/media/` is used nowhere in the worlds. |
| **J** | «چالش ۱۰۰ میلیونی» برای این سن مناسب نیست | It is literally the same `AllocationGame` component and the same smiling coins as the kids piggy bank. |
| **K** | «قدرت خرید» — سؤال بی‌ربط، تحلیل ندارد | The budget the visitor actually edits is discarded; only the multiple-choice answer is judged. Units are an abstract «واحد». |
| **L** | «قسط» — بگوید خوب است یا نه | The game reveals the total and stops. It never renders a verdict on the decision or an alternative. |

## Architecture decisions

- **Scores are derived, never accumulated.** Each round records one answer in an
  array; the score is a `filter().length` over it. A repeated tap overwrites a
  slot instead of adding to a total. This kills the whole class of bug in E, not
  just the path that was reproduced.
- **Feedback rules must be total.** `evaluateAllocation` gets an exhaustiveness
  guarantee — a property test asserts *every* reachable allocation produces at
  least one rule whose copy exists in the content file.
- **A world's visual language lives in content and tokens, not in a fork of the
  scene.** `WorldHomeScene` stays one component; what differs per world is a
  declared `surface` (art direction, card shape, whether it uses photography or
  mascots) resolved from `worlds.json`. Three copies of the scene would rot.
- **Adults use photography and data; kids keep the mascots; teens get game UI.**
  Per feedback: adults must not wear the kids' cartoon set, and the brand green
  from the logo mark becomes the adults accent.
- **No production Docker build per version.** Branch → merge → changelog entry per
  version. One image is built at the end, from the final version, once QA passes.

## Sequencing rationale

Correctness first (Phase 1) — those defects are visible to any visitor and cheap
to fix. Navigation and chrome next (Phase 2) because later phases lay content on
top of that frame. World differentiation (Phase 3) before per-game rework (Phase
4) so each reworked game is built into the visual language it will ship in.
Release last (Phase 5).

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Adults photography is thin — 8 stock images reused across scenes | Med | Audit usage first; assign each scene a distinct image; fall back to a data/chart treatment rather than repeating a photo (feedback §11.1) |
| World rework regresses the 1080p fit that was just fixed in v0.10.2 | High | Screenshot every scene at 1920×1080 after each phase and diff against the baseline captured before Phase 1 |
| Content edits break the Zod schema | Med | `npm run validate:content` runs in `build`; run it per task |
| Rewriting adult questions strays into financial advice | High | AGENTS.md forbids advice and hardcoded economic figures. Keep scenarios structural ("what matters when choosing"), keep the disclaimer, no political content |
| The scoring fix changes what a game reports | Low | Unit tests pin the new behaviour before the component changes |

## Definition of done (every task)

Inherits AGENTS.md §9, plus:

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:content` pass
- The touched scene screenshotted at 1920×1080 with no clipped or overflowing text
- A user-facing line added to `CHANGELOG-USER.md` under «منتشرنشده»
- Branch merged to `main` with `--no-ff`, per AGENTS.md §4, and registered in §12

## Open questions

1. **Adults imagery** — is there a photo set beyond `public/media/*.jpg`? Eight
   images across three worlds means repetition. Proceeding with the existing set
   plus a data-led treatment where a photo would repeat.
2. **«چالش ۱۰۰ میلیون» age band** — feedback says the age fit is wrong. Reading it
   as *the teen version must stop being the kids' toy*, not as a change to which
   world it belongs to. Flagging rather than blocking.
