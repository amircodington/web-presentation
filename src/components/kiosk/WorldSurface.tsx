"use client"

import { useEffect } from "react"
import { useCameraApi } from "@/engine"

/**
 * Dresses the document in the active scene's world palette.
 *
 * Renders nothing. The attribute goes on `<html>` rather than on a wrapper
 * because the board colour is painted by `body`, and a wrapper inside the stage
 * would leave the surround around the stage in the previous world's colour —
 * which reads as the screen half-finishing its transition.
 *
 * A scene with no `meta.world` clears the attribute rather than keeping the last
 * one, so returning to the attract loop or the gateway always lands on the shared
 * brand palette.
 */
export function WorldSurface() {
  const world = useCameraApi().current.meta?.world

  useEffect(() => {
    const root = document.documentElement
    if (world) root.dataset.world = world
    else delete root.dataset.world
  }, [world])

  return null
}
