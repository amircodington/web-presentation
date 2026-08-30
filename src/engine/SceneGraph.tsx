"use client"

import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { Camera } from "./Camera"
import { CameraProvider } from "./CameraContext"
import { Scene } from "./Scene"
import { sceneStates } from "./lifecycle"
import { fitScale } from "./projection"
import { useCamera, type CameraApi } from "./use-camera"
import { useGestures } from "./use-gestures"
import type { SceneNode, SceneState, Size } from "./types"

/** Props every scene component receives. */
export interface SceneComponentProps {
  state: SceneState
  camera: CameraApi
  /** The `props` object from this scene's entry in `scenes.json`. */
  props: Readonly<Record<string, string | number | boolean>>
}

export type SceneRegistry = Readonly<Record<string, ComponentType<SceneComponentProps>>>

interface SceneGraphProps {
  scenes: readonly SceneNode[]
  initialSceneId: string
  registry: SceneRegistry
  /**
   * Chrome rendered above the canvas and outside the scaled stage, so controls keep
   * their real pixel size on any screen. Read the camera with `useCameraApi()`.
   */
  overlay?: ReactNode
}

/**
 * Renders the whole canvas: every scene positioned in shared coordinate space,
 * under one transforming camera node.
 *
 * The viewport is a fixed design-space window. Scaling the design space to the
 * physical display happens here, once, so scenes are authored at a single known
 * size and never need responsive logic — a kiosk has exactly one screen.
 */
export function SceneGraph({ scenes, initialSceneId, registry, overlay }: SceneGraphProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  const design: Size = {
    width: kioskConfig.engine.designWidth,
    height: kioskConfig.engine.designHeight,
  }

  const [screen, setScreen] = useState<Size>(design)

  // The camera always works in design space. Only the stage below knows about the
  // physical screen, so camera maths is resolution-independent and every scene is
  // authored once against one known size.
  const { scope, camera } = useCamera({ scenes, initialSceneId, viewport: design })
  const scale = fitScale(design, screen)
  useGestures(viewportRef, camera, scale)

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setScreen({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // The API object is recreated each render, so memoization keys off the active
  // scene id rather than the object identity.
  const activeId = camera.current.id

  const states = useMemo(() => sceneStates(scenes, activeId), [scenes, activeId])

  return (
    <CameraProvider value={camera}>
    <div
      ref={viewportRef}
      data-viewport
      className="relative grid h-dvh w-dvw place-items-center overflow-hidden bg-[var(--kiosk-bg)]"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      {/*
        The stage is exactly one design frame, scaled uniformly to the screen. This
        is what guarantees a 13" laptop and a 55" TV render proportionally identical
        frames: one scale on one element, never a reflow.
      */}
      <div
        data-stage
        style={{
          position: "relative",
          width: design.width,
          height: design.height,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          overflow: "hidden",
        }}
      >
      <Camera scopeRef={scope}>
        {scenes.map((scene) => {
          const Component = registry[scene.component]
          const state = states.get(scene.id) ?? "far"
          return (
            <Scene
              key={scene.id}
              id={scene.id}
              placement={scene.camera}
              state={state}
              overview={camera.isOverview}
              onSelect={() => camera.goTo(scene.id, "dive")}
            >
              {Component ? (
                <Component state={state} camera={camera} props={scene.props ?? {}} />
              ) : (
                <MissingScene id={scene.id} component={scene.component} />
              )}
            </Scene>
          )
        })}
      </Camera>
      </div>
      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </div>
    </CameraProvider>
  )
}

/**
 * Rendered when `scenes.json` names a component that is not in the registry.
 * Visible and obviously wrong by design — a silent blank on a two-metre screen
 * is far more expensive than an ugly one.
 */
function MissingScene({ id, component }: { id: string; component: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center border-4 border-dashed border-red-500/60 text-red-400">
      <p className="text-4xl">
        صحنه «{id}» به کامپوننت ناشناخته «{component}» اشاره می‌کند
      </p>
    </div>
  )
}
