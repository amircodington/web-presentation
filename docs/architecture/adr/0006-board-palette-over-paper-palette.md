# 0006 — The board palette, replacing the paper palette

**Status:** Accepted · 2026-08-31

## Context

The kiosk shipped with a light scheme: warm paper ground, near-black ink, one sharp red.
[05 — Motion and Visual Design](../05-motion-and-visual-design.md) argued for it on the grounds
that red is the strongest attention signal at ten metres and everything else should be paper
and ink. The trade-off it named — reflections in a lit hall, video sitting poorly on a light
ground — was accepted at the time.

Three things have changed since that decision was written.

The Wealth Club emblem is now in the repository. It is **green and red**: a market candle and
a rising arrow inside a leaf, above an open book. The light scheme shared nothing with it —
a visitor looking from the emblem above the stand to the screen below it saw two unrelated
brands.

Photographs from real sessions are now in the repository, and they are the strongest asset the
product has. They show teenagers around a green board covered in plastic counters, play
banknotes and light card mats. Photographs of a dim room sit badly on cream and well on dark.

The event brief for باغ مدرسه repositions the screen as **teen and family first, experience
first** — "play, test yourself, get a result, see your path", explicitly not a course catalogue.
The paper-and-ink scheme reads as corporate collateral, which is what the brief asks it to
stop being.

## Decision

Invert the scheme. The palette is now the booth's own table:

- **Deep board green** (`--kiosk-bg`, `--kiosk-surface`) as the ground.
- **Light paper mats** (`--kiosk-card`, `--kiosk-card-text`) carrying anything read at length.
- **The emblem's red** (`--kiosk-accent`) as the single "touch this" signal, unchanged in role.
- Two meaning-only tokens that are never actions: `--kiosk-money` (gold) and
  `--kiosk-positive` (green).

A notched plastic counter — the `Chip` component — becomes the repeated object of the design,
carrying every icon and every allocation token.

## Consequences

**The reflection trade-off reverses in our favour.** A dark screen glows in a bright hall rather
than mirroring the overhead lighting back at the visitor.

**Long Persian text reversed out of a dark ground is harder to read**, and this is the real cost.
It is paid off structurally rather than hoped away: every line longer than a label is set as ink
on a light mat. AGENTS.md §8 now carries that as a rule, so it cannot quietly erode.

**`brand.json` grew four tokens** — `cardText`, `cardMuted`, `money`, `positive`. The card
surface needs its own text polarity once it is no longer the same polarity as the ground.

**Reversible from content.** The scheme is still entirely token-driven. Returning to a light
ground is a `brand.json` edit plus swapping which tokens the `mat` and `scene-surface` utilities
read — not a rewrite of the scenes.

## Alternatives considered

**Keep the light scheme and add the green as an accent.** Rejected: with red already owning
"touch this", a second saturated colour competes for the same signal, which §8 forbids for good
reason.

**Dark ground with light text everywhere, no mats.** Rejected: the syllabus blocks and game
feedback run to several lines of Persian, and reversing those out fails the readability floor
the type scale exists to protect.
