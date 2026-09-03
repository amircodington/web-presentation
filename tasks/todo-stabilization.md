# Tasks — Current-Site Stabilization & World Differentiation

Plan: [`tasks/plan-stabilization.md`](plan-stabilization.md).
One branch per task. Sizes: XS 1 file · S 1–2 · M 3–5 · L 5–8.
Every task inherits the Definition of Done in [`AGENTS.md`](../AGENTS.md) §9.

Versions are cut per phase, not per task. Only the **final** version is built as a
production Docker image.

---

## Phase 0 — Baseline

### - [x] Task 0 · Screenshot baseline at 1920×1080
`chore/qa-baseline` · S · deps: none
Capture every scene at the real TV resolution before anything changes, so each later
phase can be diffed against it. Script lives in `scripts/`, committed, reusable.
- [x] `scripts/shoot-scenes.mjs` drives the kiosk through every scene and writes PNGs
- [x] A baseline set exists for all 28 scenes
- [x] Script documented in `AGENTS.md` (Rule 0)

---

## Phase 1 — Correctness

### - [x] Task 1 · Derive game scores instead of accumulating them
`fix/game-scoring` · M · deps: 0
`MarketGame` and `JudgementGame` keep the score in a counter mutated by the tap
handler, and the choice buttons stay hit-testable through their exit animation, so a
repeated touch re-scores a round. Reproduced: a 5-round game reported «۱۰ از ۵».
Record one answer per round in an array and derive the score from it; ignore taps for
a round that is already answered.
- [x] Score is a pure function of recorded answers, in `src/lib/games/`
- [x] Repeated or rapid taps on an answered round cannot change the score
- [x] Unit tests cover: all-correct, all-wrong, double-tap, tap-then-switch
- [x] Playwright: 5 correct answers with double taps reports «۵ از ۵»

### - [x] Task 2 · Close the allocation feedback dead zone
`fix/allocation-feedback` · S · deps: 0
`evaluateAllocation` returns no rules for e.g. 5/3/2, so «قلک من» and «چالش ۱۰۰ میلیون»
show a result screen with a chart and no text. Make the rule set total.
- [x] Every reachable allocation yields ≥ 1 rule with copy present in the content file
- [x] Property test over all allocations of 10 tokens across each game's options
- [x] 5/3/2 on «قلک من» shows a feedback card

### - [x] Task 3 · Give the kids course a scene and finish its content
`fix/kids-course-detail` · M · deps: 0
`courses.json` has `kids-financial-literacy` but `scenes.json` has no matching scene,
so «جزئیات ←» silently does nothing. Add the scene, and complete the course entry
(logistics, imagery) so the explanation is whole.
- [x] `course-kids-financial-literacy` exists and is reachable from the kids reveal
- [x] Course detail renders curriculum, audience, duration and logistics
- [x] No course card anywhere routes to a missing scene (assert in a test over content)

### - [x] Task 4 · Stop world cards overflowing their own text
`fix/world-card-fit` · S · deps: 0
Adults carries qualifier + reveal + diagnostic below the experience grid; the grid row
is squeezed and card text spills past the border.
- [x] Adults world at 1920×1080 shows all four hooks inside their cards
- [x] Kids and teens unchanged
- [x] Card art sits on one baseline whatever the title length

### Checkpoint A — correctness
- [x] `lint`, `typecheck`, `test`, `validate:content` clean
- [x] Every game playable to a result that renders
- [x] No dead buttons anywhere in the tree
- [x] Cut **v0.11.0** with a user changelog entry

---

## Phase 2 — Entry path and chrome

### - [x] Task 5 · Remove the duplicated first screen
`fix/attract-duplication` · M · deps: 4
Attract and gateway ask the same question with the same three cards. Attract becomes a
true attract loop — motion, invitation, no decision — and the gateway owns the choice
(feedback §2.1, §2.2).
- [x] Attract presents one CTA and no world cards
- [x] Attract reads as an interactive screen from several metres (motion, glow, life)
- [x] Gateway is the only place the three worlds are chosen

### - [x] Task 6 · Restyle the control bar
`fix/chrome-style` · S · deps: 5
Back / Home / Mute only — «نقشه کامل» is already gone as of v0.10.1 and verified absent
on the live server; confirm, don't re-remove. Give the tray a per-world treatment and
stop it colliding with scene content.
- [x] Tray takes the active world's palette
- [x] Never overlaps scene content on any of the 28 scenes
- [x] Still Back / Home / Mute and nothing else

### - [x] Task 7 · Scale and spacing pass
`fix/scene-scale` · M · deps: 6
AGENTS.md §8 says the `pb-60` clearance is derived from the chrome's measured height
and must be re-derived when the chrome changes. It never accounted for the subtitle
bar, which sits above the tray and lands on the kids world's cards. The clearance is
also applied in design pixels while the chrome is drawn in screen pixels, so the two
disagree by the stage scale (feedback §3.3).
- [x] Bottom padding derives from the chrome's real height, not a fixed 240px
- [x] No scene has an unexplained empty band
- [x] Body text legible at 2–3 m on all 28 scenes

### Checkpoint B — frame
- [x] Screenshot diff against Task 0 baseline reviewed
- [x] Cut **v0.12.0**

---

## Phase 3 — Three worlds, three languages

### - [x] Task 8 · Declare a per-world visual language
`feat/world-surfaces` · M · deps: 7
Add a `surface` to each world in `worlds.json` (art direction, card treatment, whether
it uses mascots or photography) and resolve it in `WorldHomeScene`. One component,
three languages — not three copies.
- [x] `worlds.json` schema extended and validated
- [x] Switching world visibly changes more than the colour
- [x] No world hardcodes its own layout in a component

### - [x] Task 9 · Adults: photography and data, not cartoons
`feat/adults-visual-language` · M · deps: 8
Adults currently wear the kids' smiling piggy and rocket. Replace with real imagery and
a data/dashboard treatment, on the brand green from the logo mark (feedback §4.1).
- [x] No `Mascot` renders anywhere in the adults world
- [x] Each adults scene uses a distinct image — no repeats (feedback §11.1)
- [x] Adults reads as premium and serious next to teens

### - [x] Task 10 · Teens: game UI, levels, score reveal
`feat/teens-visual-language` · M · deps: 8
Teens must read fast, bold and competitive — neither childish nor corporate
(feedback §8.1–8.3).
- [x] Level / progress is prominent and reads correctly in RTL (fixes the mirrored dots)
- [x] Score reveal is an event: count-up, sound, badge
- [x] Teens is visibly not the kids world

### - [x] Task 11 · Kids: fewer words, more picture
`feat/kids-visual-language` · S · deps: 8
Kids keeps the mascots but must be simpler than teens (feedback §7.1).
- [x] Shorter sentences, larger art, fewer simultaneous elements
- [x] Reward on every game end
- [x] Repeated icons within one screen eliminated

### Checkpoint C — worlds
- [x] Three worlds side by side are unmistakably different
- [x] Screenshot diff reviewed
- [x] Cut **v0.13.0**

---

## Phase 4 — Game content the feedback named

### - [x] Task 12 · Rebuild «چالش ۱۰۰ میلیون» for teenagers
`feat/teens-100m` · M · deps: 10
Today it is the kids' piggy bank with different labels and the same smiling coins.
- [x] Mechanic and art distinct from «قلک من»
- [x] Result speaks to what this visitor actually did (feedback §6.2)
- [x] Playable in 30–90 s (feedback §5.4)

### - [x] Task 13 · Rework «چالش هوش مالی» items
`feat/teens-financial-iq` · M · deps: 10
Age-appropriate design plus an item review; the قسط item should judge the decision, not
just compare prices — say whether it is a good idea and what to do instead.
- [x] Progress reads «سؤال ۱ از ۶» with the first dot lit, in RTL
- [x] Each item's options are genuinely distinguishable
- [x] Result is analytical, not a bare number

### - [x] Task 14 · «قدرت خرید» — analyse what the visitor actually did
`feat/adults-purchasing-power` · L · deps: 9
The budget the visitor edits is thrown away; only the multiple-choice answer is judged,
and the question is loosely related to the game (feedback §9.1–9.3).
- [x] The result analyses the visitor's own budget, not just their answer
- [x] Question follows from the budget they built
- [x] Units are concrete, not «واحد»
- [x] UI fits 1920×1080 with no dead band

### - [x] Task 15 · «قسط» — verdict and alternative
`feat/adults-instalments` · M · deps: 9
The game reveals the total and stops. Feedback: say whether this is a good idea, and if
not, what to do instead.
- [x] After the reveal, a verdict on the decision
- [x] When the verdict is negative, a concrete alternative
- [x] No financial advice, no hardcoded economic figures (AGENTS.md §2)

### - [x] Task 16 · Adults result is analytical
`feat/adults-analysis` · M · deps: 14, 15
Feedback §9.3: نقطه قوت / نقطه قابل بهبود / قدم بعد across the named dimensions, then
the recommendation.
- [x] Multi-dimension readout
- [x] Strength, gap, next step
- [x] Leads into the matching product (feedback §6.3, §14.1)

### Checkpoint D — content
- [x] Every game has intro → action → feedback → result → recommendation
- [x] Cut **v0.14.0**

---

## Phase 5 — Release

### - [x] Task 17 · Full QA at 1920×1080
`chore/qa-full` · M · deps: 16
Walk all 28 scenes and every game to a result. Idle reset, session clear, audio, no
console errors.
- [x] Every scene screenshotted, no clipping or overflow
- [x] Every game reaches a rendering result
- [x] No dead buttons, no console errors
- [x] Findings either fixed or written up

### - [ ] Task 18 · Final version, image, push
`chore/release` · M · deps: 17
Only now is a production image built.
- [x] `CHANGELOG-USER.md` and `CHANGELOG.md` describe every version in this programme
- [x] Final version released and tagged
- [x] Production Docker image builds and serves
- [x] All branches merged and pushed to GitHub

### Checkpoint E — done
- [x] QA found no open bug
- [x] `main` pushed, tag on the remote
