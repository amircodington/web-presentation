"use client"

import { useEffect, useInsertionEffect, useRef } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import type { CameraApi } from "./use-camera"

const SWIPE_MIN_DISTANCE = 90
const SWIPE_MAX_DURATION_MS = 600
const DOUBLE_TAP_WINDOW_MS = 320
const TAP_SLOP = 12
/** Selector for anything whose pointer gestures are its own, never the camera's. */
const SCENE_CONTENT =
  'button, a, input, select, textarea, [role="button"], [data-gesture]'

interface Pointer {
  x: number
  y: number
  startX: number
  startY: number
  startedAt: number
  /**
   * Whether this pointer went down on something that handles its own gesture, in
   * which case the canvas must keep its hands off it entirely.
   */
  onContent: boolean
}

/**
 * Touch and pointer handling for the canvas.
 *
 * Attaches to the viewport rather than the canvas so gestures still register over
 * gaps between scenes. Browser-native pinch-zoom, double-tap-zoom, long-press menu
 * and overscroll-back are all suppressed: on a kiosk each of those is a visible
 * failure, not a feature — an accidental overscroll navigates the browser out of
 * the app entirely.
 *
 * A gesture that begins on scene content is left to that content. The canvas used
 * to read every pointer, so a child dragging a coin from the tray to the far
 * bucket in «قلک من» covered more than the swipe threshold horizontally and was
 * thrown out of the game the moment they let go: the coin landed and the camera
 * left with it. Panning the board is a gesture on the board; anything starting on
 * a button or on a piece you can pick up belongs to the scene.
 */
export function useGestures(
  viewportRef: React.RefObject<HTMLElement | null>,
  camera: CameraApi,
  /** Stage scale, so a drag moves the canvas by the distance the finger travelled. */
  stageScale = 1,
) {
  // Held in a ref so the listeners below never re-subscribe mid-gesture: swapping
  // handlers while a finger is down loses the pointer's start position.
  const cameraRef = useRef(camera)
  const scaleRef = useRef(stageScale)
  useInsertionEffect(() => {
    cameraRef.current = camera
    scaleRef.current = stageScale || 1
  }, [camera, stageScale])

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return

    const pointers = new Map<number, Pointer>()
    let lastPinchDistance = 0
    let lastTapAt = 0

    const onPointerDown = (event: PointerEvent) => {
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
        onContent: startedOnContent(event.target),
      })
      // Capture only once a second finger lands. Capturing a single pointer on the
      // viewport retargets its pointerup, which swallows the click on whichever
      // button the visitor actually pressed.
      if (pointers.size === 2) {
        lastPinchDistance = pinchDistance(pointers)
        for (const id of pointers.keys()) element.setPointerCapture(id)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const pointer = pointers.get(event.pointerId)
      if (!pointer) return

      const dx = event.clientX - pointer.x
      const dy = event.clientY - pointer.y
      pointer.x = event.clientX
      pointer.y = event.clientY

      if (pointers.size === 2) {
        const distance = pinchDistance(pointers)
        if (lastPinchDistance > 0) {
          const factor = distance / lastPinchDistance
          const s = scaleRef.current
          cameraRef.current.nudge({ scale: clampFactor(factor), x: dx / 2 / s, y: dy / 2 / s })
        }
        lastPinchDistance = distance
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      const pointer = pointers.get(event.pointerId)
      pointers.delete(event.pointerId)
      if (pointers.size < 2) {
        lastPinchDistance = 0
        if (element.hasPointerCapture(event.pointerId)) {
          element.releasePointerCapture(event.pointerId)
        }
      }
      if (!pointer || pointer.onContent) return

      const dx = event.clientX - pointer.startX
      const dy = event.clientY - pointer.startY
      const distance = Math.hypot(dx, dy)
      const elapsed = performance.now() - pointer.startedAt

      if (distance < TAP_SLOP) {
        const now = performance.now()
        if (now - lastTapAt < DOUBLE_TAP_WINDOW_MS) {
          cameraRef.current.recenter()
          lastTapAt = 0
        } else {
          lastTapAt = now
        }
        return
      }

      // A horizontal swipe advances the journey. RTL reading direction means a
      // swipe toward the start of the line (leftward) moves forward.
      if (
        elapsed < SWIPE_MAX_DURATION_MS &&
        Math.abs(dx) > SWIPE_MIN_DISTANCE &&
        Math.abs(dx) > Math.abs(dy) * 1.5
      ) {
        if (dx < 0) cameraRef.current.next()
        else cameraRef.current.back()
      }
    }

    const preventDefault = (event: Event) => event.preventDefault()

    element.addEventListener("pointerdown", onPointerDown)
    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerup", onPointerUp)
    element.addEventListener("pointercancel", onPointerUp)
    element.addEventListener("contextmenu", preventDefault)
    element.addEventListener("gesturestart", preventDefault)
    element.addEventListener("dblclick", preventDefault)

    return () => {
      element.removeEventListener("pointerdown", onPointerDown)
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerup", onPointerUp)
      element.removeEventListener("pointercancel", onPointerUp)
      element.removeEventListener("contextmenu", preventDefault)
      element.removeEventListener("gesturestart", preventDefault)
      element.removeEventListener("dblclick", preventDefault)
    }
  }, [viewportRef])
}

/**
 * Whether a pointer went down on something the scene itself handles.
 *
 * Buttons and form controls answer for their own taps, and anything marked
 * `data-gesture` — the draggable coins and cards in the games — answers for its
 * own drags.
 */
function startedOnContent(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return target.closest(SCENE_CONTENT) !== null
}

function pinchDistance(pointers: Map<number, Pointer>): number {
  const [a, b] = [...pointers.values()]
  if (!a || !b) return 0
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Keeps a single pinch frame from producing an unusable jump. */
function clampFactor(factor: number): number {
  const { minZoom, maxZoom } = kioskConfig.engine
  return Math.min(maxZoom / minZoom, Math.max(minZoom / maxZoom, factor))
}
