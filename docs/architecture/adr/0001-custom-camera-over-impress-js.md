# 0001 — Custom camera layer instead of impress.js or reveal.js

**Status:** Accepted · 2026-08-30

## Context

The brief calls for a Prezi-style zooming presentation rather than a linear slideshow, running
in React on a touchscreen kiosk. Three options exist.

**impress.js** is the original open-source implementation of the Prezi idea and does zoom,
rotate and pan out of the box. But authoring is HTML-only via `data-` attributes, it drives the
DOM through global mutation, and its maintenance has gone quiet. Integrating it with React means
either surrendering the canvas subtree to it or fighting reconciliation on every transition.

**reveal.js** is the best-maintained framework in the category with by far the largest
ecosystem, but it is fundamentally a linear two-axis deck. It offers no true zooming interface,
and its motion ceiling is fragments plus Auto-Animate.

**A custom camera layer** requires writing the transform maths ourselves.

## Decision

Build a custom camera layer in `src/engine/`: scenes absolutely positioned in a shared
coordinate space, and one wrapping element whose `transform` is animated to the inverse of the
target scene's placement.

## Consequences

**Positive.** Total control over easing, gesture handling, interruption behaviour and RTL
correctness — all four of which matter more on a kiosk than on a laptop. Only one element
animates, and only via `transform`, so the compositor handles the move on the GPU and the frame
rate does not depend on how much content is on screen. No dependency that can go stale before
the festival. The engine stays free of product concerns and could be extracted later.

**Negative.** Roughly 200 lines of transform maths we own and must test. No community
ecosystem — no plugins, no themes, no Stack Overflow answers. Mid-flight interruption and
gesture conflict resolution are genuinely fiddly and are where the bugs will be.

**Mitigation.** `projection.ts` is pure and exhaustively unit-tested. Gestures and lifecycle get
Playwright coverage. Scene positions live in `content/scenes.json`, so the authoring experience
stays declarative even though the engine is bespoke.
