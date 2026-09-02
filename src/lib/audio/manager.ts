import type { AudienceGroup } from "@/content/schema/common"
import type { AudioFile } from "@/content/schema/audio"
import { resolveSrc, resolveVolume, shouldPlay } from "./mixer"

/** What a fired cue produced, so the caller can caption it. */
export interface Fired {
  subtitle?: string
  /** How long the caption should stay up. */
  holdMs: number
}

/** Brief §54 caps a spoken line at five seconds; a caption outlives its audio. */
const CAPTION_HOLD_MS = 4_000

/** Backstop for a concurrency slot whose `ended` never arrives. */
const SLOT_GUARD_MS = 5_000

/**
 * The kiosk's one sound source.
 *
 * Everything about *whether* and *how loud* lives in `mixer.ts` and is pure;
 * this class owns only the parts that need a browser — a decoded element per
 * file, the count of what is currently sounding, and the autoplay unlock.
 *
 * Elements are cloned per playback rather than rewound and reused. A single
 * element cannot overlap with itself, and two coins landing a beat apart is
 * exactly what the kids' games do.
 */
export class AudioManager {
  private readonly pool = new Map<string, HTMLAudioElement>()
  private readonly lastPlayedAt = new Map<string, number>()
  private playing = 0
  private world: AudienceGroup | undefined
  private muted = false
  /**
   * Browsers refuse to sound anything before a user gesture. Until the first
   * touch the kiosk is deliberately silent rather than throwing on every cue —
   * the attract loop is watched, not interacted with.
   */
  private unlocked = false

  constructor(private readonly config: AudioFile) {}

  /** Fetches and decodes every file up front. Called once, off the critical path. */
  preload(): void {
    for (const cue of Object.values(this.config.cues)) {
      for (const src of [cue.src, ...Object.values(cue.byWorld ?? {})]) {
        if (src && !this.pool.has(src)) {
          const element = new Audio(src)
          element.preload = "auto"
          this.pool.set(src, element)
        }
      }
    }
  }

  setWorld(world: AudienceGroup | undefined): void {
    this.world = world
  }

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  unlock(): void {
    this.unlocked = true
  }

  /**
   * Sounds a cue by name, and returns its caption.
   *
   * A cue that is silenced — muted, debounced, capped, or simply caption-only —
   * still returns its subtitle. Brief §55: the text is the guaranteed channel and
   * the audio is the enhancement, never the other way round.
   */
  play(id: string): Fired | undefined {
    const cue = this.config.cues[id]
    if (!cue) return undefined

    const fired: Fired = { subtitle: cue.subtitle, holdMs: CAPTION_HOLD_MS }
    const src = resolveSrc(cue, this.world)
    if (!src || !this.unlocked) return fired

    const now = Date.now()
    const allowed = shouldPlay({
      enabled: this.config.enabled,
      muted: this.muted,
      debounceMs: this.config.debounceMs,
      maxConcurrent: this.config.maxConcurrent,
      lastPlayedAt: this.lastPlayedAt.get(id),
      now,
      playing: this.playing,
    })
    if (!allowed) return fired

    const source = this.pool.get(src)
    if (!source) return fired

    this.lastPlayedAt.set(id, now)
    this.playing += 1

    const voice = source.cloneNode() as HTMLAudioElement
    voice.volume = resolveVolume(this.config, cue, this.world)

    let released = false
    const done = () => {
      if (released) return
      released = true
      clearTimeout(guard)
      this.playing = Math.max(0, this.playing - 1)
    }
    voice.addEventListener("ended", done, { once: true })
    // A file that fails to decode must not leak a slot, or the second failure
    // silences the kiosk for the rest of the day.
    voice.addEventListener("error", done, { once: true })
    // Nor may a browser that simply never fires `ended` — this screen runs
    // unattended for seven hours, and a leaked slot is permanent silence with no
    // symptom anyone at the booth could diagnose. Brief §54 caps a cue at four
    // seconds, so anything still holding a slot after that is not playing.
    const guard = setTimeout(done, SLOT_GUARD_MS)

    void voice.play().catch(done)

    return fired
  }
}
