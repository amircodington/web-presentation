"use client"

import { content } from "@/content/load"
import { sceneRegistry } from "@/components/scenes"
import { SceneGraph, type SceneNode } from "@/engine"
import { IdleReset } from "./IdleReset"
import { KioskChrome } from "./KioskChrome"
import { KioskTheme } from "./KioskTheme"

const scenes = content.scenes.scenes as readonly SceneNode[]

/** Mounts the canvas and the chrome that sits above it. The whole app. */
export function KioskCanvas() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      <KioskTheme />
      <SceneGraph
        scenes={scenes}
        initialSceneId={content.scenes.initialScene}
        registry={sceneRegistry}
        overlay={
          <>
            <IdleReset />
            <KioskChrome />
          </>
        }
      />
    </main>
  )
}
