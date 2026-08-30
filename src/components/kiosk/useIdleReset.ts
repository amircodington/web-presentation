"use client"

import { useEffect, useInsertionEffect, useRef } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { useSession } from "@/store/session"
import type { CameraApi } from "@/engine"

const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel"] as const

/**
 * Returns the kiosk to the attract scene and wipes the session after a period of
 * inactivity.
 *
 * The session wipe is the point: a visitor who walks away mid-quiz must not leave
 * their answers on screen for the next person. Pointer, keyboard and wheel all
 * count as activity, so the timer never fires while someone is still interacting.
 */
export function useIdleReset(camera: CameraApi | undefined) {
  const reset = useSession((store) => store.reset)
  const cameraRef = useRef(camera)
  useInsertionEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    if (!camera) return
    let timer: ReturnType<typeof setTimeout>

    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        reset()
        cameraRef.current?.home()
      }, kioskConfig.idleTimeoutMs)
    }

    schedule()
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, schedule, { passive: true })

    return () => {
      clearTimeout(timer)
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, schedule)
    }
  }, [camera, reset])
}
