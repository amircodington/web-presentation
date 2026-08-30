"use client"

import type { ReactNode, RefObject } from "react"

interface CameraProps {
  /** The canvas node. This is the only element in the app that transforms. */
  scopeRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

/**
 * The single transforming node.
 *
 * Every scene is a child positioned in canvas space; moving the camera applies
 * one transform here rather than touching any scene. The browser promotes this
 * to a compositor layer, so a move costs the same regardless of how much content
 * is on the canvas — which is the whole performance argument for this design.
 */
export function Camera({ scopeRef, children }: CameraProps) {
  return (
    <div
      ref={scopeRef}
      data-camera
      style={{
        position: "absolute",
        // Physical left/top and an explicit LTR direction are deliberate. The canvas
        // is a maths space, not a layout: under RTL, logical insets would place its
        // origin at the viewport's right edge and silently mirror every coordinate.
        // Scenes restore `direction: rtl` for their own content.
        direction: "ltr",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transformOrigin: "0 0",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  )
}
