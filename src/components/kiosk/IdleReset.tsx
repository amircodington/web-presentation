"use client"

import { useCameraApi } from "@/engine"
import { useIdleReset } from "./useIdleReset"

/** Renders nothing; exists so the idle timer sits inside the camera provider. */
export function IdleReset() {
  useIdleReset(useCameraApi())
  return null
}
