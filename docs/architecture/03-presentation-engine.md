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
| `meta.idleReturn` | Marks the scene the idle timer resets to |

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

## Gestures — `use-gestures.ts`

| Gesture | Result |
|---|---|
| Tap | Normal interaction, forwarded to the scene |
| Swipe left/right | `next()` / `back()` |
| Pinch | Free zoom, clamped to 0.4×–2.5× of the scene's authored scale |
| Two-finger drag | Free pan, clamped to the canvas bounding box plus 20% margin |
| Double-tap | Re-centre the current scene, cancelling any free pan or zoom |
| Any free pan/zoom, then 6s idle | Eases back to the authored camera for the current scene |

That last rule is what keeps an exploratory kiosk from being left in a broken-looking state by
a curious visitor. Free exploration is allowed; it is just always temporary.

Touch events use Pointer Events with `touch-action: none` on the viewport. Suppress the
browser's own pinch-zoom, double-tap-zoom, long-press menu, and overscroll — on a kiosk these
are all failure modes, not features.

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

## Testing the engine

`projection.ts` is pure maths and gets exhaustive unit tests — identity, scale, rotation,
composition order, and the property that `project()` always lands the scene's centre at the
viewport centre. The gesture and lifecycle layers get Playwright tests. The camera itself is
verified by visual snapshots at rest on each scene.
