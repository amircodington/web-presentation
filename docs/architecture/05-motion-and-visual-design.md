# 05 — Motion and Visual Design

Motion is the product here, not decoration. A static screen in an exhibition hall is invisible;
peripheral vision detects movement long before it resolves detail. Everything below serves one
goal: be noticed from ten metres, be obvious from one.

## The motion principles

**Motion carries meaning, or it does not exist.** Every animation answers one of three
questions for the visitor: *where did this come from*, *where am I now*, or *what should I touch
next*. An animation that answers none of those is deleted.

**The camera is spatial memory.** Because navigation is a physical move across a canvas, going
back must retrace the exact path forward. If "back" takes a different route than "forward", the
mental map breaks and the whole zooming interface stops paying for itself.

**Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, `margin`, or
`filter: blur` on anything large. Those trigger layout or paint on every frame; on kiosk-grade
hardware that is the difference between 60fps and 24fps. This is lint-enforced.

**Nothing loops for more than 20 seconds without variation.** A perfectly repeating ambient
animation reads as a frozen screen to anyone watching from a distance for a few seconds.

## Timing

One scale, used everywhere. Ad-hoc durations are how a product ends up feeling inconsistent
without anyone being able to say why.

| Token | Duration | Use |
|---|---|---|
| `instant` | 120ms | Touch feedback — press states, ripples |
| `quick` | 240ms | Local UI — a card lifting, a badge appearing |
| `base` | 450ms | Element entrances, list staggers |
| `slow` | 900ms | Scene-internal choreography |
| `cinematic` | 1400ms | Camera moves, hero reveals |

Easing: `cubic-bezier(.22,1,.36,1)` for anything arriving (fast start, soft landing — it reads
as confident), `cubic-bezier(.4,0,1,1)` for anything leaving, and springs only for touch
feedback where a little overshoot reads as physical.

**Touch response is exempt from all of this and must be under 100ms.** A visitor who taps and
sees nothing for 300ms taps again, and now the kiosk has two navigations queued. Visual
feedback on press is the single most important animation in the product, and it is also the
least glamorous.

## Type

Persian display type at kiosk scale is the whole visual identity, so it is worth being precise.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero | 96–140px | Bold | One line. Two at most. Never three |
| Scene title | 56–72px | SemiBold | |
| Body | 32–40px | Regular | Minimum readable at 1.5m |
| Caption | 24px | Regular | Prices, ages, durations |
| Never below | 22px | — | Anything smaller is decoration, not information |

Two faces, self-hosted by Next at build time — a Google Fonts request at runtime is a blank
screen when the venue wifi drops.

| Face | Role |
|---|---|
| **Vazirmatn** | Everything readable. Full weight range, proper Persian numerals |
| **Lalezar** | Hero lines and big numbers only, via the `display` utility |

Lalezar is a poster face: one weight, heavy, and unmistakably Persian rather than a Latin
family with Persian glyphs bolted on. That is right for the three or four lines a passer-by
reads at ten metres and wrong for everything else, which is why it is reached through a utility
class rather than set on the body.

Persian digits (`۱۲۳`) are rendered via a formatter, never by swapping fonts.

Line height for Persian runs higher than Latin — `1.7` for body, `1.15` for display — because
the script's ascenders and diacritics collide at tighter settings.

## Colour

Sourced from `brand.json` into CSS custom properties, so a rebrand is a JSON edit.

The screen is the board game box the booth already has open on its table. Visitors sit around
a printed board pushing counters and play banknotes; the screen is built from the same
materials.

| Material | Token | Role |
|---|---|---|
| The printed board | `--kiosk-bg` | Butter yellow. The ground everything is played on |
| Cards | `--kiosk-card`, `--kiosk-card-text` | White. Anything a visitor has to *read* sits on one |
| Ink | `--kiosk-border` | Deep navy. Every outline, every shadow, all body text |
| The counter | `--kiosk-accent` | Sharp red. Exactly one "touch this" per screen |

Three supporting tokens carry meaning and never an action: `--kiosk-money` (marigold — scores,
prices, coin values), `--kiosk-positive` (turquoise — growth, correct answers), and
`--kiosk-joy` (grape), which belongs to the characters and says nothing.

**This replaces the dark green table, deliberately.** The visitors this screen has to stop are
nine to sixteen years old. A deep green felt ground with red counters reads to an adult as a
game table and to a child as a casino — the wrong metaphor for a financial literacy club, and
the wrong brightness for a stand competing with hall lighting. Butter yellow is warm enough for
white cards to lift off it and bright enough that the screen reads as *open* rather than as a
lit panel in a dark room.

The cost is real and worth stating: a light screen reflects overhead lighting more than a dark
one did, and the photographs of real sessions sat better on the dark ground. Off-white rather
than pure white in the cards, and 14:1 ink contrast, are what pay for it. Check it on the actual
TV under the venue's lights; the palette is a JSON edit away either direction.

Components never hardcode a white or black alpha. Card fill, outlines, and on-card text are
tokens sourced from `brand.json`, so the whole scheme can be changed from content.

Exactly one accent colour signals "touch this". If two things on screen use the accent, the
visitor has to make a decision, and visitors at a booth do not make decisions — they leave.
This is why the persistent chrome never takes the solid accent.

## Ink and lift

The signature device, and the one place the design spends its boldness.

Every piece a visitor can touch carries a 4px navy outline and a hard, **unblurred** shadow
offset down and to the right. A blurred shadow says "floating panel". A hard one says "a printed
piece lying on a board", which is the difference between a screen a child reads and one a child
touches.

The press is a movement rather than a tint: the piece travels into its own shadow until the
shadow is gone, the way a physical key does. That is legible from two metres, which a colour
change is not — and press feedback is the most important animation in the product, because a
visitor who taps and sees nothing taps again, and the kiosk then has two navigations queued.

Restraint is what keeps this from looking cheap: **outlines belong only to things you can touch
or pick up.** Headings, body copy and the board itself stay clean.

## The cast

Six characters for the six places money can go, plus the coin itself, in `components/ui/Mascot.tsx`.
Each has a body drawn on one 100-unit grid at one ink weight, and a face with five moods.

They exist because a nine-year-old will not weigh «پس‌انداز نقدی» against «بورس / صندوق» as
labels, but will absolutely notice that one character looks delighted and the other looks queasy.
**The mood is a state channel, never decoration.** `lib/games/cast.ts` derives it from what the
player has done: a character looks happier as it is fed until the pile becomes a concentration,
at which point it goes dizzy. A child who has made a character dizzy has already met
diversification, and the written feedback then names what they saw rather than introducing it.

The character a content option gets is derived from its icon, so adding an allocation option to
`activities.json` gets a character without a second content edit. A test asserts that content
cannot introduce an option the cast does not cover — a board of identical fallback coins teaches
nothing.

## Motion icons

`components/ui/MotionIcon.tsx` gives an icon an idle loop chosen **by meaning**: money falls,
charts climb, clocks tick, everything else sways. An icon that moves the wrong way is worse than
one that sits still, because it teaches the wrong thing to a visitor who is here to learn exactly
that. Transform and opacity only, so a screen full of them still holds 60fps on the TV's own
media player.

Across a hall, a still screen and a broken screen look identical. These loops are what say the
thing is running.

## The chip

The kiosk's older repeated object, still used for step markers and schedule counters.

A notched plastic counter, drawn in `components/ui/Chip.tsx` as two background layers: a radial
gradient paints the face and one pressed groove, and a repeating conic gradient shows through in
the band the face leaves uncovered to form the rim notches.

Inside the games the coin *character* has replaced it: a child drags coins, so the result should
stack coins. The chip remains where a piece needs to read as a marker rather than as money.

## The persistent chrome

Back, home, the map and next live in one tray rather than as four loose pills. Four buttons
floating over a scene read as four separate decisions; one tray reads as "the navigation",
which is what it is, and it stops the controls competing with the scene's own call to action.

The tray keys its offset off `--kiosk-stage-margin`, a custom property the engine publishes
from the stage's rendered geometry, so it clears the card's edge by the same distance on any
screen rather than only on a 1920×1080 one.

The map is tinted, never solid. Exactly one thing on screen may read as "touch this", and on
every screen that is the scene's, not the navigation's.

## The attract loop

The most important scene in the product and the only one most passers-by will ever see.

It must be **unmistakably alive at ten metres**. The cast is what does that here: five
characters lined up along the board's printed track, each bobbing on its own period so the row
never resolves into a single marching block, with coins travelling the track behind them.

The cast is the hero rather than the headline, because the passer-by is usually a child with a
parent a step behind. Below it sit **two equal doors**, not one primary and one afterthought:
games and the sixty-second test. The child and the parent want different things from the same
screen and neither should have to hunt for theirs — and games is the loud one, because «بازی» is
what a nine-year-old walks toward. The quiz reads far better as the thing they do *after* a game
has already made them curious.

The camera itself drifts slowly (`drift` preset) around the attract scene rather than sitting
still. The screen is never truly static.

## Video

| Rule | Reason |
|---|---|
| Muted, looped, `playsInline`, `preload="auto"` | Autoplay policy, and audio in a hall is noise |
| H.264 MP4, ≤ 8 MB, ≤ 20s | Decode cost and memory on kiosk hardware |
| Always with a `poster` | The first frame must never be black |
| Only the active scene plays | Multiple decoding videos is the top frame-rate killer |
| Local files in `public/media` | No streaming, no CDN, no network dependency |

`BackgroundVideo` in `components/media/` enforces the last two automatically from the scene's
lifecycle state.

## Imagery

Photographs use a slow **Ken Burns** drift — 1.0× to 1.08× scale over 20 seconds, panning toward
the `focalPoint` declared in the content. It is subtle enough that nobody consciously notices,
and it is the difference between a screen that looks live and one that looks like a JPEG.

Images ship as AVIF with WebP fallback, sized for the actual display resolution and no larger.

## Accessibility, honestly scoped

This is an unattended public kiosk, not a website, so the applicable subset is narrower but
sharper: touch targets ≥ 88px, contrast ≥ 7:1, no information conveyed by colour alone, no
timing that forces a decision, and full keyboard operability for the hidden admin overlay.

`prefers-reduced-motion` is respected — camera moves collapse to short cross-fades and ambient
loops stop. The kiosk's own hardware will not set it, but the code path must exist and be
correct, because it is also how the app behaves in test.

## What to avoid

Rotation beyond ±8° reads as a gimmick. More than three simultaneous animations on one screen
reads as chaos. Parallax on more than two layers costs more than it returns. And a camera move
longer than 1.5 seconds, however beautiful, is 1.5 seconds a visitor spends unable to act — at
a booth, that is the most expensive thing in this document.
