import { describe, expect, it } from "vitest"
import { sceneStates } from "./lifecycle"
import type { SceneNode } from "./types"

function scene(id: string, over: Partial<SceneNode> = {}): SceneNode {
  return {
    id,
    component: "Stub",
    camera: { x: 0, y: 0, scale: 1, rotate: 0 },
    transition: "glide",
    ...over,
  }
}

const graph: SceneNode[] = [
  scene("attract", { next: "home" }),
  scene("home", { next: "quiz", back: "attract" }),
  scene("quiz", { back: "home" }),
  scene("orphan"),
]

describe("sceneStates", () => {
  it("marks exactly one scene active", () => {
    const states = sceneStates(graph, "home")
    expect([...states.values()].filter((s) => s === "active")).toHaveLength(1)
    expect(states.get("home")).toBe("active")
  })

  it("marks forward and backward neighbours as near", () => {
    const states = sceneStates(graph, "home")
    expect(states.get("quiz")).toBe("near")
    expect(states.get("attract")).toBe("near")
  })

  it("marks scenes that point at the active one as near", () => {
    const states = sceneStates(graph, "quiz")
    expect(states.get("home")).toBe("near")
  })

  it("marks unreachable scenes as far", () => {
    expect(sceneStates(graph, "home").get("orphan")).toBe("far")
  })

  it("covers every scene", () => {
    expect(sceneStates(graph, "attract").size).toBe(graph.length)
  })

  it("handles an unknown active id without throwing", () => {
    const states = sceneStates(graph, "nope")
    expect([...states.values()].every((s) => s === "far")).toBe(true)
  })
})
