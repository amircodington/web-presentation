"use client"

import { useEffect, useRef } from "react"
import { useCameraApi } from "@/engine"
import { useSound } from "./AudioProvider"

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
 *
 * It publishes the same fact to the mixer, and sounds the arrival. Both belong
 * here because this is the one component that sits inside the camera and knows
 * which world is on screen — see `AudioProvider`, which sits outside it.
 */
export function WorldSurface() {
  const scene = useCameraApi().current
  const world = scene.meta?.world
  const { play, setWorld } = useSound()

  useEffect(() => {
    const root = document.documentElement
    if (world) root.dataset.world = world
    else delete root.dataset.world
    setWorld(world)
  }, [setWorld, world])

  // The world is set above in the same commit, so an arrival is already heard in
  // the voice of the world being arrived in.
  const arrivedAt = useRef(scene.id)
  useEffect(() => {
    if (arrivedAt.current === scene.id) return
    arrivedAt.current = scene.id
    play("move")
  }, [play, scene.id])

  return null
}
