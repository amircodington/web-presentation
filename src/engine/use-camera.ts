"use client"

import { useAnimate } from "motion/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { canvasToViewport, fitBounds, project, sceneExtent, toCss } from "./projection"
import { transitionSpec } from "./transitions"
import type { CameraTransform, SceneNode, Size, TransitionName } from "./types"

/** Imperative control over the canvas camera. Every method is safe mid-transition. */
export interface CameraApi {
  goTo(sceneId: string, transition?: TransitionName): void
  next(): void
  back(): void
  /** Goes to the hub — the scene marked `meta.hub`. The visitor-facing "home". */
  home(): void
  /**
   * Returns to the attract loop, the scene marked `meta.idleReturn`.
   *
   * Deliberately separate from `home()`: the idle timer must land on the attract
   * screen, but a visitor pressing "home" expects the hub they navigate from, not
   * the screensaver.
   */
  attract(): void
  /** Applies a free pan/zoom delta from the gesture layer, bypassing scene framing. */
  nudge(delta: Partial<CameraTransform>): void
  /** Eases back to the current scene's authored framing. */
  recenter(): void
  /** Pulls the camera back to frame the entire canvas — the overview map. */
  overview(): void
  /** Leaves the overview and returns to the current scene. */
  exitOverview(): void
  readonly current: SceneNode
  readonly isMoving: boolean
  readonly isFreeform: boolean
  readonly isOverview: boolean
}

interface UseCameraOptions {
  scenes: readonly SceneNode[]
  initialSceneId: string
  viewport: Size
}

/**
 * Drives the single transforming canvas element.
 *
 * Transitions run through Motion's animation controls rather than CSS classes,
 * because a visitor will tap a second target mid-flight and the camera must
 * retarget from its current interpolated position with velocity preserved.
 * CSS transitions cannot be interrupted gracefully; this is the reason for the
 * dependency.
 */
export function useCamera({ scenes, initialSceneId, viewport }: UseCameraOptions) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [currentId, setCurrentId] = useState(initialSceneId)
  const [isMoving, setIsMoving] = useState(false)
  const [isFreeform, setIsFreeform] = useState(false)
  const [isOverview, setIsOverview] = useState(false)
  const freeformTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const byId = useMemo(
    () => new Map(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  )

  const current = byId.get(currentId) ?? scenes[0]!
  const hubId = useMemo(
    () => scenes.find((scene) => scene.meta?.hub)?.id ?? scenes[0]!.id,
    [scenes],
  )
  const attractId = useMemo(
    () => scenes.find((scene) => scene.meta?.idleReturn)?.id ?? scenes[0]!.id,
    [scenes],
  )

  const applyImmediate = useCallback(
    (transform: CameraTransform) => {
      if (scope.current) scope.current.style.transform = toCss(transform)
    },
    [scope],
  )

  const flyToTransform = useCallback(
    async (target: CameraTransform, transitionName?: TransitionName) => {
      const spec = transitionSpec(transitionName)
      const options = { duration: spec.durationMs / 1000, ease: [...spec.ease] as const }

      setIsMoving(true)
      setIsFreeform(false)

      // The apex leg pulls the camera back before descending onto the target.
      // Split as two animations on the same element so an interrupting call
      // retargets from wherever the first leg has reached.
      if (spec.apexScaleFactor !== undefined) {
        const apexAt = spec.apexAt ?? 0.45
        const midpoint = midway(scope.current, target, spec.apexScaleFactor, viewport)
        await animate(scope.current, cssFrom(midpoint), {
          ...options,
          duration: (spec.durationMs * apexAt) / 1000,
        })
        await animate(scope.current, cssFrom(target), {
          ...options,
          duration: (spec.durationMs * (1 - apexAt)) / 1000,
        })
      } else {
        await animate(scope.current, cssFrom(target), options)
      }

      setIsMoving(false)
    },
    [animate, scope, viewport],
  )

  const flyTo = useCallback(
    (scene: SceneNode, transitionName?: TransitionName) =>
      flyToTransform(project(scene.camera, viewport), transitionName ?? scene.transition),
    [flyToTransform, viewport],
  )

  const goTo = useCallback(
    (sceneId: string, transition?: TransitionName) => {
      const scene = byId.get(sceneId)
      if (!scene) return
      setIsOverview(false)
      if (sceneId === currentId) {
        void flyTo(scene, transition)
        return
      }
      setCurrentId(sceneId)
      void flyTo(scene, transition)
    },
    [byId, currentId, flyTo],
  )

  const next = useCallback(() => {
    if (current.next) goTo(current.next)
  }, [current.next, goTo])

  const back = useCallback(() => {
    if (current.back) goTo(current.back)
  }, [current.back, goTo])

  const home = useCallback(() => goTo(hubId, "home"), [goTo, hubId])
  const attract = useCallback(() => goTo(attractId, "home"), [attractId, goTo])

  const recenter = useCallback(() => {
    setIsFreeform(false)
    if (isOverview) return
    void flyTo(current, "glide")
  }, [current, flyTo, isOverview])

  const overview = useCallback(() => {
    setIsFreeform(false)
    setIsOverview(true)
    const extent = sceneExtent(
      scenes.map((scene) => scene.camera),
      viewport,
    )
    // Extra room at the bottom keeps the chrome bar clear of the scene cards.
    void flyToTransform(
      fitBounds(extent, viewport, { top: 90, right: 90, bottom: 300, left: 90 }),
      "home",
    )
  }, [flyToTransform, scenes, viewport])

  const exitOverview = useCallback(() => {
    setIsOverview(false)
    void flyTo(current, "dive")
  }, [current, flyTo])

  const nudge = useCallback(
    (delta: Partial<CameraTransform>) => {
      const base = readTransform(scope.current) ?? project(current.camera, viewport)
      applyImmediate({
        x: base.x + (delta.x ?? 0),
        y: base.y + (delta.y ?? 0),
        scale: base.scale * (delta.scale ?? 1),
        rotate: base.rotate + (delta.rotate ?? 0),
      })
      setIsFreeform(true)
    },
    [applyImmediate, current.camera, scope, viewport],
  )

  // Free exploration is always temporary: a curious visitor must never be able to
  // leave the screen in a state the next visitor cannot understand.
  useEffect(() => {
    clearTimeout(freeformTimer.current)
    if (!isFreeform || isOverview) return
    freeformTimer.current = setTimeout(recenter, kioskConfig.gestureRecenterMs)
    return () => clearTimeout(freeformTimer.current)
  }, [isFreeform, isOverview, recenter])

  // Frame the initial scene without animating, and reframe on viewport resize.
  useEffect(() => {
    applyImmediate(project(current.camera, viewport))
    // Only re-run on viewport change; scene changes are animated by `flyTo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height])

  const api: CameraApi = {
    goTo,
    next,
    back,
    home,
    attract,
    nudge,
    recenter,
    overview,
    exitOverview,
    current,
    isMoving,
    isFreeform,
    isOverview,
  }

  return { scope, camera: api }
}

function cssFrom(transform: CameraTransform) {
  return {
    x: transform.x,
    y: transform.y,
    scale: transform.scale,
    rotate: transform.rotate,
  }
}

/**
 * Builds the wide apex framing between the camera's current position and its
 * target: the midpoint of the two, pulled back by the transition's scale factor.
 */
function midway(
  element: HTMLElement | null,
  target: CameraTransform,
  scaleFactor: number,
  viewport: Size,
): CameraTransform {
  const from = readTransform(element) ?? target
  const scale = Math.min(from.scale, target.scale) * scaleFactor
  const ratio = scale / target.scale

  // Keep the apex centred between the two framings in canvas space, not screen space,
  // so the pull-back reveals what lies between them.
  const fromCanvas = viewportCentreInCanvas(from, viewport)
  const targetCanvas = viewportCentreInCanvas(target, viewport)
  const midCanvas = {
    x: (fromCanvas.x + targetCanvas.x) / 2,
    y: (fromCanvas.y + targetCanvas.y) / 2,
  }

  return {
    x: viewport.width / 2 - midCanvas.x * scale,
    y: viewport.height / 2 - midCanvas.y * scale,
    scale,
    rotate: target.rotate * ratio,
  }
}

/** Inverse of `canvasToViewport` for the viewport centre under a given camera. */
function viewportCentreInCanvas(camera: CameraTransform, viewport: Size) {
  const dx = viewport.width / 2 - camera.x
  const dy = viewport.height / 2 - camera.y
  const theta = (-camera.rotate * Math.PI) / 180
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return {
    x: (dx * cos - dy * sin) / camera.scale,
    y: (dx * sin + dy * cos) / camera.scale,
  }
}

/** Reads the live transform off the element so interruptions resume from it. */
function readTransform(element: HTMLElement | null): CameraTransform | null {
  if (!element) return null
  const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)
  const scale = Math.hypot(matrix.a, matrix.b)
  if (scale === 0) return null
  return {
    x: matrix.e,
    y: matrix.f,
    scale,
    rotate: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
  }
}

export { canvasToViewport }
