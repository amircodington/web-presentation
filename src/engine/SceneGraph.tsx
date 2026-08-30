"use client"

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { Camera } from "./Camera"
import { Scene } from "./Scene"
import { sceneStates } from "./lifecycle"
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
  /** Receives the camera API once mounted, for idle reset and chrome controls. */
  onReady?: (camera: CameraApi) => void
}

/**
 * Renders the whole canvas: every scene positioned in shared coordinate space,
 * under one transforming camera node.
 *
 * The viewport is a fixed design-space window. Scaling the design space to the
 * physical display happens here, once, so scenes are authored at a single known
 * size and never need responsive logic — a kiosk has exactly one screen.
 */
export function SceneGraph({ scenes, initialSceneId, registry, onReady }: SceneGraphProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<Size>(() => ({
    width: kioskConfig.engine.designWidth,
    height: kioskConfig.engine.designHeight,
  }))

  const { scope, camera } = useCamera({ scenes, initialSceneId, viewport })
  useGestures(viewportRef, camera)

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setViewport({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // The API object is recreated each render, so consumers and memoization key off
  // the active scene id instead of the object identity.
  const activeId = camera.current.id

  useEffect(() => {
    onReady?.(camera)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const states = useMemo(() => sceneStates(scenes, activeId), [scenes, activeId])

  return (
    <div
      ref={viewportRef}
      data-viewport
      className="relative h-dvh w-dvw overflow-hidden bg-[var(--kiosk-bg)]"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <Camera scopeRef={scope}>
        {scenes.map((scene) => {
          const Component = registry[scene.component]
          const state = states.get(scene.id) ?? "far"
          return (
            <Scene key={scene.id} id={scene.id} placement={scene.camera} state={state}>
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
