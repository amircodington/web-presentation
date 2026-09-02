"use client"

import { content } from "@/content/load"
import { sceneRegistry } from "@/components/scenes"
import { SceneGraph, type SceneNode } from "@/engine"
import { AudioProvider } from "./AudioProvider"
import { IdleReset } from "./IdleReset"
import { KioskChrome } from "./KioskChrome"
import { KioskTheme } from "./KioskTheme"
import { Subtitles } from "./Subtitles"
import { WorldSurface } from "./WorldSurface"

const scenes = content.scenes.scenes as readonly SceneNode[]

/**
 * Mounts the canvas and the chrome that sits above it. The whole app.
 *
 * Sound wraps everything rather than the chrome: most of the noise this product
 * makes comes from inside a game.
 */
export function KioskCanvas() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      <KioskTheme />
      <AudioProvider>
        <SceneGraph
          scenes={scenes}
          initialSceneId={content.scenes.initialScene}
          registry={sceneRegistry}
          overlay={
            <>
              <IdleReset />
              <WorldSurface />
              <Subtitles />
              <KioskChrome />
            </>
          }
        />
      </AudioProvider>
    </main>
  )
}
