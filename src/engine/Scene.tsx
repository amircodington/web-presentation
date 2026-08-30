"use client"

import { memo, useEffect, useRef, type ReactNode } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import type { SceneState, ScenePlacement } from "./types"

interface SceneProps {
  id: string
  placement: ScenePlacement
  state: SceneState
  /** In overview mode every scene is visible and selectable, whatever its state. */
  overview?: boolean
  onSelect?: () => void
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
export const Scene = memo(function Scene({
  id,
  placement,
  state,
  overview = false,
  onSelect,
  children,
}: SceneProps) {
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
      aria-hidden={state !== "active" && !overview}
      inert={state !== "active" && !overview ? true : undefined}
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
        // A scene is a card: decorative layers (ambient orbs, the offer scene's
        // radial rays) must not paint outside it, or the overview map's computed
        // extent understates what is actually drawn and the outer scenes clip.
        overflow: "hidden",
        borderRadius: 48,
        pointerEvents: overview || state === "active" ? "auto" : "none",
        willChange: state === "far" && !overview ? "auto" : "transform",
      }}
    >
      {children}
      {overview ? <OverviewTarget id={id} active={state === "active"} onSelect={onSelect} /> : null}
    </section>
  )
})

/**
 * Covers a scene while the overview map is open so the whole card is one target.
 * Without it, a visitor would have to hit whatever button happens to sit under
 * their finger in a scene shrunk to thumbnail size.
 */
function OverviewTarget({
  id,
  active,
  onSelect,
}: {
  id: string
  active: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`رفتن به ${id}`}
      className="absolute inset-0 cursor-pointer rounded-[48px] transition-colors"
      style={{
        border: `6px solid ${active ? "var(--kiosk-accent)" : "var(--kiosk-border)"}`,
        background: active
          ? "transparent"
          : "color-mix(in oklab, var(--kiosk-bg) 45%, transparent)",
      }}
    />
  )
}
