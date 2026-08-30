import type { SceneNode, SceneState } from "./types"

/**
 * Classifies every scene relative to the active one.
 *
 * `near` covers anything one navigation edge away, which is what is visible
 * during a transition. Everything else is `far` and renders as a low-detail
 * placeholder with no media and no animation — mounting every video at once is
 * the single largest frame-rate cost in the app.
 */
export function sceneStates(
  scenes: readonly SceneNode[],
  activeId: string,
): ReadonlyMap<string, SceneState> {
  const neighbours = new Set<string>()
  const active = scenes.find((scene) => scene.id === activeId)

  if (active) {
    if (active.next) neighbours.add(active.next)
    if (active.back) neighbours.add(active.back)
    for (const scene of scenes) {
      if (scene.next === activeId || scene.back === activeId) neighbours.add(scene.id)
    }
  }

  return new Map(
    scenes.map((scene) => [
      scene.id,
      scene.id === activeId ? "active" : neighbours.has(scene.id) ? "near" : "far",
    ]),
  )
}
