"use client"

import { createContext, useContext } from "react"
import type { CameraApi } from "./use-camera"

const CameraContext = createContext<CameraApi | null>(null)

export const CameraProvider = CameraContext.Provider

/**
 * Access to the live camera from anywhere under the SceneGraph.
 *
 * Context rather than a callback prop on purpose: the camera API object is rebuilt
 * on every render, and a `onReady`-style callback can only re-publish it when its
 * dependency list says so. That leaves overlays holding a stale API and silently
 * reading last render's `isOverview` or `isMoving`.
 */
export function useCameraApi(): CameraApi {
  const camera = useContext(CameraContext)
  if (!camera) throw new Error("useCameraApi must be used inside a SceneGraph")
  return camera
}
