# 03 — The Presentation Engine

The Prezi effect, in full. This document is the specification for `src/engine/`.

## The core idea

Every scene is absolutely positioned in a shared, unbounded coordinate space called the
**canvas**. The viewport shows a window onto that canvas. Navigating to a scene does not move
the scene — it moves the window, by applying the **inverse** of the scene's own transform to
the single canvas element.

```text
┌─ viewport ─ 1920×1080, overflow:hidden ────────┐
│                                                 │
│   canvas  ← the only element that transforms    │
│                                                 │
│      [attract]         [home]                   │
│       0,0              -2400,0                  │
│                                                 │
│                    [quiz]       [course]        │
│                  -2400,1600   -5200,-900 rot-6  │
└─────────────────────────────────────────────────┘
```

Because only one node animates, and only via `transform`, the browser promotes it to a
compositor layer and the whole move — however many elements are visible — costs the same as
animating a single div. That is the entire performance argument for this design.

## The maths

`projection.ts` is pure and fully unit-tested. Given a scene and the viewport, it produces the
camera transform that centres that scene.

```ts
/**
 * Computes the canvas transform that brings the given scene to the centre of the
 * viewport at the scene's authored scale and rotation.
 *
 * The result is the inverse of the scene's own placement: to look at something,
 * move the world the opposite way.
 */
export function project(scene: SceneNode, viewport: Size): CameraTransform
```

The order of operations is fixed and must not be varied, because transform composition is not
commutative:

```text
translate(viewport.width / 2, viewport.height / 2)   ← put origin at screen centre
  → rotate(-scene.rotate)
  → scale(1 / scene.scale)
  → translate(-scene.x, -scene.y)                    ← pull the scene to origin
```

Written as a CSS `transform` string on the canvas, with `transform-origin: 0 0`.

## Scene authoring — `content/scenes.json`

The show is data. Adding a scene, reordering the journey, or changing a camera move is a JSON
edit.

```jsonc
{
  "designSize": { "width": 1920, "height": 1080 },
  "initialScene": "attract",
  "scenes": [
    {
      "id": "attract",
      "component": "AttractScene",
      "camera": { "x": 0, "y": 0, "scale": 1, "rotate": 0 },
      "transition": "drift",
      "next": "home",
      "meta": { "idleReturn": true }
    },
    {
      "id": "quiz-intro",
      "component": "QuizIntroScene",
      "camera": { "x": -2400, "y": 1600, "scale": 1.4, "rotate": 0 },
      "transition": "dive",
      "next": "quiz-q1",
      "back": "home"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Unique. Referenced by `next`, `back`, and by `goTo()` |
| `component` | Key into the scene component registry in `components/scenes/index.ts` |
| `camera.x/y` | Position in canvas units. Negative X reads as "further along the journey" |
| `camera.scale` | > 1 means the scene is authored large and the camera zooms *in* to it |
| `camera.rotate` | Degrees. Use sparingly — beyond ±8° it reads as a gimmick, not a flourish |
| `transition` | Named preset from `transitions.ts` |
| `next` / `back` | Default navigation targets |
| `meta.idleReturn` | The attract loop — where the idle timer returns to. Exactly one |
| `meta.hub` | The hub — where the "home" control goes. Exactly one, and **not** the same scene as `idleReturn`: a visitor pressing home expects the hub they navigate from, not the screensaver |
| `props` | Passed verbatim to the scene component, so one component can serve many scenes — the four quiz questions are one `QuizQuestionScene` differing only by `questionIndex` |

Validated by `scenes.schema.ts`. Unreachable scenes, duplicate ids, and dangling `next`
references fail the build.

## Transition presets — `transitions.ts`

Named so `scenes.json` stays readable and the motion language stays consistent. Each preset is
a duration plus an easing plus an optional mid-flight camera nudge.

| Preset | Feel | Used for |
|---|---|---|
| `drift` | 1400ms, gentle ease-in-out, slight overshoot | Ambient attract-loop movement |
| `glide` | 900ms, `cubic-bezier(.22,1,.36,1)` | The default. Sibling-to-sibling |
| `dive` | 1100ms, zooms *out* to a wider framing at 45% before zooming into the target | Entering a subsection. This arc is what reads as "Prezi" |
| `snap` | 450ms, sharp ease-out | Quiz question to question. Must feel responsive, not cinematic |
| `rise` | 1200ms, ease-out with a vertical lead-in | Revealing a result or an offer |
| `home` | 1300ms, `dive` with a wider apex | Returning to the hub from anywhere |

`dive` deserves the note: a straight interpolation between two distant scenes flies the camera
across intervening content at high speed, which looks like a glitch. Pulling back first, then
descending, is what makes a large jump legible. Implement it as a three-keyframe GSAP timeline
on the camera state, not as two chained transitions.

## The camera API — `use-camera.ts`

```ts
/** Imperative control over the canvas camera. Safe to call mid-transition. */
interface CameraApi {
  /** Moves to a scene by id, using that scene's transition unless overridden. */
  goTo(sceneId: string, transition?: TransitionName): void
  /** Follows the current scene's `next` edge. No-op at the end of a branch. */
  next(): void
  /** Follows the current scene's `back` edge. */
  back(): void
  /** Returns to the scene marked `meta.idleReturn`. Used by the idle timer. */
  home(): void
  readonly current: SceneNode
  readonly isMoving: boolean
}
```

**Interruption is the hard part.** A visitor will tap a second button mid-flight. The camera
must retarget from its *current interpolated position* with preserved velocity, never snap to
the abandoned destination first. Motion's animation controls handle this natively — do not
implement transitions as CSS classes, which cannot be interrupted gracefully.

## Touch — `use-canvas-guards.ts`

| Touch | Result |
|---|---|
| Tap on a card or a control | Normal interaction, forwarded to the scene |
| Anything else — swipe, pinch, two-finger drag, double-tap | Nothing. The frame does not move |

**The camera is fixed.** It moves only when a scene or the control tray calls `goTo`, `next`,
`back`, `home` or `attract`, and it always rests on the authored framing of the current scene.
There is no free pan, no free zoom, and nothing to re-centre.

An earlier build offered pinch-zoom, two-finger pan and swipe navigation, with a six-second
timer to ease the frame back afterwards. On a 55" screen at standing height that was not
exploration: a coat sleeve or a second visitor's hand moved the frame, the timer was far too
slow to read as a correction, and the only way anyone found back was pressing «بازگشت» and
walking into the scene again. A kiosk frame that can be moved by accident will be, and the
visitor who moved it is never the one who knows how to put it back.

What remains is defensive. Pointer Events with `touch-action: none` on the viewport, the
document's viewport meta refusing user scaling, and this layer cancelling Safari's `gesture*`
events, double-tap zoom and the long-press menu. Chrome's `--disable-pinch` and
`--overscroll-history-navigation=0` cover the same ground at the browser level — see
[05-kiosk-deployment.md](../operations/05-kiosk-deployment.md).

## Scene lifecycle

Rendering all scenes at all times is what makes the zoom-out reveal work — you must be able to
see neighbouring content during a `dive`. But mounting every scene's video and animation at once
is what kills the frame rate. The compromise:

| State | Condition | Behaviour |
|---|---|---|
| `active` | Camera is on it | Full render, entrance timeline runs, video plays, interactive |
| `near` | Within one edge of active, or visible during a transition | Rendered, static, media paused on first frame, `pointer-events: none` |
| `far` | Everything else | Rendered as a low-detail placeholder, no media, no animation |

Scenes receive their state as a prop and are responsible for honouring it. `BackgroundVideo`
and `ParticleField` in `components/media/` do this automatically.

## Entrance choreography

Scene *transitions* are the camera's job. What happens *inside* a scene when it becomes active
is GSAP's. Each scene component exports an optional timeline factory:

```ts
/** Builds the entrance timeline for this scene. Called when the scene becomes active. */
export function timeline(root: HTMLElement): gsap.core.Timeline
```

The engine plays it on activation and reverses it on deactivation. This split is deliberate:
the camera never needs to know what is inside a scene, and a scene never needs to know where
it sits on the canvas.

## Fitting the design space to a screen

Scenes are authored once at a fixed design size (`ENGINE_DESIGN_WIDTH` ×
`ENGINE_DESIGN_HEIGHT`). A **stage** element of exactly that size sits between the
viewport and the camera, and carries a single uniform `scale()`:

```text
viewport   100dvw × 100dvh, grid place-items-center
└── stage  1920×1080, transform: scale(fitScale(design, screen))
    └── camera
        └── scenes
```

`fitScale` is `min(screen.w / design.w, screen.h / design.h)` — the limiting axis,
so nothing is ever cropped or distorted. This is what makes a 13" laptop and a 55"
TV render **proportionally identical** frames; verified by measuring an element's
centre as a fraction of the stage at 1440×900, 1920×1080 and 3840×2160, which agree
to four decimal places.

Percentage-based sizing cannot promise that: percentages reflow when the aspect
ratio changes, so a 16:10 laptop and a 16:9 TV would produce different line breaks
and different relative type sizes. The cost of the stage approach is letterbox bars
when the aspect ratios differ; they are painted in the kiosk background and are
invisible in practice.

The stage is centred **geometrically** — `left/top: 50%` plus a `translate(-50%, -50%)`
under an explicit `direction: ltr` — never by grid or flex alignment. `transform` does
not affect layout, so the stage is still a full 1920px wide to the layout engine and
overflows any narrower screen; centring an overflowing item inside an RTL
`overflow: hidden` container shifts it sideways. This is the same lesson as the RTL
trap below: anything geometric must be expressed as a transform, not as layout
alignment.

Because the camera always works in design space, its maths is resolution
independent. The stage scale is needed only where screen pixels and design pixels
have to be reconciled — the chrome clearance in `clearance.ts`.

## Why there is no overview map

An earlier build had one: `camera.overview()` framed the whole canvas so a visitor could see the
presentation and jump anywhere in one tap. It is gone, and it is worth recording why rather than
leaving the next person to rebuild it.

Brief §63 names a sitemap as something this kiosk must not have. A visitor standing in a loud hall
has exactly one navigation question — how do I get back — and a second mode that rearranges the
whole screen is a question they did not ask. The three-world redesign also made the map less
useful than it looks: the scenes a visitor may go to are the four cards already on their world
home, and everything else on the canvas belongs to somebody else's world.

`sceneExtent` and `fitBounds` went with it. They were the map's geometry and nothing else used
them.

Scenes still clip to their own bounds (`overflow: clip`, never `hidden` — see above). Decorative
layers that deliberately overflow, such as the offer scene's radial rays, would otherwise paint
over the neighbouring scene during a wide transition.

## Canvas layout rules

Two invariants are enforced by `scripts/validate-content.ts` rather than left to
review, because both fail in ways that are easy to miss on the scene you are working on:

**Scenes must not overlap in canvas space.** A `dive` transition pulls the camera back
between two scenes, and overlapping scenes mean it flies *through* content it should
be passing over. The check computes each scene's rotated axis-aligned box and reports every
colliding pair.

**Every scene reserves clearance for the chrome bar.** The persistent controls sit
outside the stage at a fixed pixel size, occupying roughly 204 design pixels at the
bottom. Scenes therefore carry `pb-60`; without it, the last row of content sits
underneath the navigation. The constant is derived from the tray's measured height
rather than chosen, and must be re-derived when the chrome changes size — it moved
from `pb-52` when the tray took the ink outline and grew. Verified by measuring, for
each scene, whether any leaf element intersects the chrome's bounding box.

Padding alone does not guarantee clearance. A scene whose content is taller than its
box overflows *past* its own padding, so a footer can sit under the tray however much
`pb-` is applied. When a measurement shows an overlap, check the content height before
reaching for more padding.

## Clip, never hide

`overflow: hidden` creates a scroll container. The browser scrolls the nearest one when
focus lands on an element outside the visible box — and React moving focus after a state
change is enough. A game rendering its result button therefore scrolled the *stage*,
which shifts every scene relative to a camera whose transform is unchanged.

That failure is genuinely hard to read: the camera transform is byte-for-byte correct,
every scene's placement is correct, the stage's own box is correct, and the frame is
still wrong. The only visible symptom is that a 0×0 absolutely-positioned camera node
reports a moved `getBoundingClientRect` — which is the scroll offset, not a transform.

The stage and every scene therefore use `overflow: clip`, which clips without ever
becoming scrollable.

## The RTL trap

The canvas is a coordinate space, not a layout. Positioning it with logical
properties puts its origin at the viewport's **right** edge under `dir="rtl"`, and
the scene wrapper's own logical inset then adds a compensating offset in the
opposite direction. The two cancel exactly at `scale: 1` — so the first scene looks
perfect and every scaled scene is wrong by a factor of its own scale.

The camera and scene wrappers therefore use physical `left`/`top` with an explicit
`direction: ltr`, and each scene sets `direction: rtl` back on its own content. This
is the one place in the codebase where physical properties are correct, and lint is
configured to allow them under `src/engine/` only.

## Testing the engine

`projection.ts` is pure maths and gets exhaustive unit tests — identity, scale, rotation,
composition order, and the property that `project()` always lands the scene's centre at the
viewport centre. `trail.ts` and `lifecycle.ts` are pure too and unit-tested beside it. The
camera itself is verified by `scripts/shoot-scenes.mjs`, which walks every scene by touching
what a visitor touches and fails when a frame is wrong.
