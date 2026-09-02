"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { content } from "@/content/load"
import { AudioManager } from "@/lib/audio/manager"
import type { AudienceGroup } from "@/content/schema/common"

interface SoundApi {
  /** Sounds a cue by name and raises its caption. Safe to call anywhere. */
  play(cueId: string): void
  muted: boolean
  toggleMuted(): void
  /** The caption currently showing, if any. */
  subtitle?: string
  /**
   * Tells the mixer which world is on screen, which decides both the volume and
   * often the file. Called by `SceneSounds`, which is the only thing that knows.
   */
  setWorld(world: AudienceGroup | undefined): void
}

const SoundContext = createContext<SoundApi | null>(null)

/**
 * Owns the kiosk's sound: one manager, the mute switch, and the caption the
 * subtitle bar is showing.
 *
 * It wraps the *whole* canvas rather than the chrome. A game is where most of
 * the sound in this product happens, and a provider that only covers the overlay
 * hands every scene the silent fallback — which fails quietly, in the one part of
 * the app where quiet is indistinguishable from working.
 *
 * It therefore sits outside the camera, and learns which world is on screen from
 * `SceneSounds`, which sits inside it.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false)
  const [subtitle, setSubtitle] = useState<string>()
  const captionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const manager = useMemo(() => new AudioManager(content.audio), [])

  useEffect(() => {
    manager.preload()
  }, [manager])

  useEffect(() => {
    manager.setMuted(muted)
  }, [manager, muted])

  // Browsers will not sound anything until the visitor has touched the screen.
  // The attract loop is therefore silent by design, and the first tap — which is
  // always the one that enters the gateway — is what turns the kiosk on.
  useEffect(() => {
    const unlock = () => manager.unlock()
    window.addEventListener("pointerdown", unlock, { once: true })
    return () => window.removeEventListener("pointerdown", unlock)
  }, [manager])

  useEffect(() => () => clearTimeout(captionTimer.current), [])

  const play = useCallback(
    (cueId: string) => {
      const fired = manager.play(cueId)
      if (!fired?.subtitle) return
      setSubtitle(fired.subtitle)
      clearTimeout(captionTimer.current)
      captionTimer.current = setTimeout(() => setSubtitle(undefined), fired.holdMs)
    },
    [manager],
  )

  // The press cue is wired once here rather than repeated in every scene, and is
  // caught at the window rather than inside the Button primitive: scenes build
  // their own touchables — audience cards, doorways, coins — and a sound design
  // that only covers one component is a sound design with silent holes in it.
  useEffect(() => {
    const onPress = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const control = target?.closest("button")
      // A control that sounds its own cue does not also get the generic press.
      // Two sounds for one finger is the stacking brief §54 bans, and it burns a
      // concurrency slot the meaningful cue then cannot have.
      if (control && !control.closest("[data-sound='own']")) play("tap")
    }
    window.addEventListener("pointerdown", onPress)
    return () => window.removeEventListener("pointerdown", onPress)
  }, [play])

  const setWorld = useCallback((world: AudienceGroup | undefined) => manager.setWorld(world), [manager])

  const api: SoundApi = {
    play,
    muted,
    toggleMuted: () => setMuted((current) => !current),
    subtitle,
    setWorld,
  }

  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>
}

/**
 * Access to the kiosk's sound from anywhere under the provider.
 *
 * Returns a no-op outside it rather than throwing. A component that makes a
 * noise must still render on the `/booth` tablet and in a test, and a sound
 * effect is never worth crashing a screen for.
 */
export function useSound(): SoundApi {
  return useContext(SoundContext) ?? SILENT
}

const SILENT: SoundApi = {
  play: () => {},
  muted: true,
  toggleMuted: () => {},
  setWorld: () => {},
}
