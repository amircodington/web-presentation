"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { Camera } from "./Camera"
import { CameraProvider } from "./CameraContext"
import { Scene } from "./Scene"
import { sceneStates } from "./lifecycle"
import { chromeClearancePx } from "./clearance"
import { fitScale } from "./projection"
import { useCamera, type CameraApi } from "./use-camera"
import { useCanvasGuards } from "./use-canvas-guards"
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
  const scale = fitScale(design, screen, kioskConfig.engine.stageInsetPx)
  // Published so the chrome, which lives outside the scaled stage, can sit a fixed
  // distance from the stage's edge rather than from the screen's.
  const stageMargin = Math.max(0, (screen.height - design.height * scale) / 2)
  // What scenes must keep clear at their foot so the chrome never lies on top of
  // content. Derived rather than chosen, and in the stage's own units — see
  // `clearance.ts` for why a fixed number of design pixels cannot be right.
  const chromeClearance = chromeClearancePx(scale)
  useCanvasGuards(viewportRef)

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
      className="absolute inset-0"
      /* Deeper than the board, so the stage reads as a card lying on a surround. */
      style={{
        touchAction: "none",
        overscrollBehavior: "none",
        // `clip`, never `hidden` — see the stage below.
        overflow: "clip",
        background: "color-mix(in oklab, var(--kiosk-bg) 72%, var(--kiosk-border))",
      }}
    >
      {/*
        The stage is exactly one design frame, scaled uniformly to the screen. This
        is what guarantees a 13" laptop and a 55" TV render proportionally identical
        frames: one scale on one element, never a reflow.

        Centred geometrically (left/top 50% plus a translate), never by grid or flex
        alignment. `transform` does not affect layout, so the stage is still 1920px
        wide to the layout engine and overflows any narrower screen — and centring an
        overflowing item inside an RTL `overflow: hidden` box shifts it sideways.
        Physical offsets under an explicit LTR direction avoid that entirely.
      */}
      <div
        data-stage
        style={{
          position: "absolute",
          direction: "ltr",
          left: "50%",
          top: "50%",
          width: design.width,
          height: design.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
          // Published on the stage so every scene can reserve the band without
          // knowing anything about the chrome that sits above it.
          ["--kiosk-chrome-clearance" as string]: `${chromeClearance}px`,
          /*
           * `clip` rather than `hidden`, and the difference is not cosmetic.
           *
           * `overflow: hidden` still makes a scroll container, and the browser
           * scrolls the nearest one when focus lands on an element outside the
           * visible box. A scene that renders a button on a state change — a game
           * showing its result, a quiz advancing — therefore scrolls the stage,
           * which shifts every scene relative to a camera that has not moved. The
           * frame ends up permanently off-centre with no transform to blame.
           *
           * `overflow: clip` clips without ever becoming scrollable.
           */
          overflow: "clip",
          // The board itself. Without it a wide transition, where the camera pulls
          // back between two scenes, shows the surround through the stage and the
          // card frame disappears mid-flight.
          background: "var(--kiosk-bg)",
          // Matches the radius every scene carries, so the stage clips to the same
          // card silhouette the scenes are drawn as.
          borderRadius: 48,
          boxShadow: "0 0 0 5px var(--kiosk-border)",
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
              world={scene.meta?.world}
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
      {overlay ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ "--kiosk-stage-margin": `${stageMargin}px` } as CSSProperties}
        >
          {overlay}
        </div>
      ) : null}
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
