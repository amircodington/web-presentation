"use client"

import { useState } from "react"
import { content } from "@/content/load"
import { sceneRegistry } from "@/components/scenes"
import { SceneGraph, type CameraApi, type SceneNode } from "@/engine"
import { KioskChrome } from "./KioskChrome"
import { KioskTheme } from "./KioskTheme"
import { useIdleReset } from "./useIdleReset"

const scenes = content.scenes.scenes as readonly SceneNode[]

/** Mounts the canvas and the chrome that sits above it. The whole app. */
export function KioskCanvas() {
  const [camera, setCamera] = useState<CameraApi>()
  useIdleReset(camera)

  return (
    <main className="relative h-dvh w-dvw overflow-hidden">
      <KioskTheme />
      <SceneGraph
        scenes={scenes}
        initialSceneId={content.scenes.initialScene}
        registry={sceneRegistry}
        onReady={setCamera}
      />
      <div className="pointer-events-none absolute inset-0">
        <KioskChrome camera={camera} />
      </div>
    </main>
  )
}
