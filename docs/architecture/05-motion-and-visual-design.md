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

Fonts are **self-hosted** in `public/fonts` and subset — a Google Fonts request is a blank
screen when the venue wifi drops. Vazirmatn or Estedad are the sensible choices; both have
proper Persian numerals and a real weight range. Persian digits (`۱۲۳`) are rendered via a
formatter, never by swapping fonts.

Line height for Persian runs higher than Latin — `1.7` for body, `1.15` for display — because
the script's ascenders and diacritics collide at tighter settings.

## Colour

Sourced from `brand.json` into CSS custom properties, so a rebrand is a JSON edit. Until the
client supplies values, the placeholders live in one place and are clearly marked.

The kiosk is designed **dark**. A bright screen in a hall is a mirror; a dark screen with
saturated accents holds contrast under overhead lighting and makes video content sit in the
page instead of floating on it. Text sits at 7:1 contrast minimum — AAA, not AA, because the
viewing distance is three times a desktop's.

Exactly one accent colour signals "touch this". If two things on screen use the accent, the
visitor has to make a decision, and visitors at a booth do not make decisions — they leave.

## The attract loop

The most important scene in the product and the only one most passers-by will ever see.

It must be **unmistakably alive at ten metres** — full-bleed muted video or a large-scale
particle/gradient field, slow continuous drift, and a pulsing touch affordance. It must state
the value proposition in one line of hero type, and it must show a literal hand-touching-screen
cue, because a surprising number of people do not know a large screen is interactive.

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
