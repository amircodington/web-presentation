import type { SceneNode } from "./types"

/**
 * The route a visitor actually took, and where "back" leads because of it.
 *
 * A scene's authored `back` edge is one fixed answer, which is right only while a
 * scene has one caller. Business School sits on the teens' reveal *and* on the
 * adults', and its edge could name only one of them — it named the gateway, so a
 * visitor who opened a course from a reveal was dropped at the front door with no
 * way back to the other courses on the page they had just been reading. Hence a
 * trail: where the visitor came from is the only answer that is right every time,
 * and the authored edge remains the fallback for a scene reached without one.
 *
 * Kept here, pure and separate from the camera, because this is the part with the
 * rules — the camera only animates.
 */

/** How many steps of a visit the camera keeps. */
export const TRAIL_LIMIT = 24

/**
 * The trail after moving from `from`.
 *
 * Capped rather than unbounded: a visitor who wanders the whole hall needs a step
 * out of where they are, not a recording of the afternoon.
 */
export function remember(trail: readonly string[], from: string): readonly string[] {
  return [...trail, from].slice(-TRAIL_LIMIT)
}

/**
 * Where "back" goes, and the trail left behind once it has gone there.
 *
 * `undefined` target means there is nowhere back — the visitor is at the start of
 * their visit and the scene names no edge either.
 */
export function stepBack(
  trail: readonly string[],
  scene: Pick<SceneNode, "back">,
): { target: string | undefined; trail: readonly string[] } {
  const came = trail.at(-1)
  if (came !== undefined) return { target: came, trail: trail.slice(0, -1) }
  return { target: scene.back, trail }
}

/**
 * Whether the chrome should draw a way back at all.
 *
 * Takes the trail's depth rather than the trail, because the camera holds the
 * trail itself in a ref and only its depth is state the chrome can rerender on.
 */
export function canGoBack(depth: number, scene: Pick<SceneNode, "back">): boolean {
  return depth > 0 || scene.back !== undefined
}
