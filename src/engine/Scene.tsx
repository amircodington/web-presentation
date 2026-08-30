"use client"

import { memo, useEffect, useRef, type ReactNode } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import type { SceneState, ScenePlacement } from "./types"

interface SceneProps {
  id: string
  placement: ScenePlacement
  state: SceneState
  children: ReactNode
}

/**
 * Positions one scene in canvas space and exposes its lifecycle state to the
 * subtree via a data attribute, so media components can pause themselves without
 * prop drilling.
 *
 * Every scene stays mounted. That is what makes the zoom-out apex of a `dive`
 * transition meaningful — you must be able to see the neighbouring content you
 * are flying over. What varies is how much each scene renders: see `SceneState`.
 */
export const Scene = memo(function Scene({ id, placement, state, children }: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const { designWidth, designHeight } = kioskConfig.engine

  // Entrance choreography belongs to the scene, not the camera. A scene exports a
  // `timeline` factory; the engine plays it on activation and reverses it on exit.
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.dispatchEvent(
      new CustomEvent("scenestatechange", { detail: { state }, bubbles: false }),
    )
  }, [state])

  return (
    <section
      ref={ref}
      id={`scene-${id}`}
      data-scene={id}
      data-state={state}
      aria-hidden={state !== "active"}
      inert={state !== "active" ? true : undefined}
      style={{
        position: "absolute",
        // Positioned in the canvas's LTR maths space (see Camera), then switched
        // back to RTL so the Persian content inside lays out correctly.
        direction: "rtl",
        left: 0,
        top: 0,
        width: designWidth,
        height: designHeight,
        transform: `translate(-50%, -50%) translate(${placement.x}px, ${placement.y}px) rotate(${placement.rotate}deg) scale(${placement.scale})`,
        pointerEvents: state === "active" ? "auto" : "none",
        willChange: state === "far" ? "auto" : "transform",
      }}
    >
      {children}
    </section>
  )
})
