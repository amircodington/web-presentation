import type { AudienceGroup } from "@/content/schema/common"
import type { AudioFile, Cue } from "@/content/schema/audio"

/** Everything the manager needs to decide about one cue, with no DOM involved. */
export interface CueDecision {
  /** The file to play, or `undefined` when the cue is caption-only or silenced. */
  src?: string
  /** Final volume, 0–1. */
  volume: number
  /** Caption to show, whether or not there is a file. */
  subtitle?: string
}

/**
 * Which file a cue resolves to in a given world.
 *
 * A world override wins; otherwise the shared file is used. Returning
 * `undefined` for a caption-only cue is the point rather than an edge case —
 * brief §55 wants a line the team has written but not yet recorded to keep
 * showing its subtitle.
 */
export function resolveSrc(cue: Cue, world?: AudienceGroup): string | undefined {
  if (world) {
    const override = cue.byWorld?.[world]
    if (override) return override
  }
  return cue.src
}

/**
 * Master × context × cue.
 *
 * The context term is the world's own volume, or the attract volume outside any
 * world — the attract loop plays to a corridor, not to someone at the glass.
 */
export function resolveVolume(config: AudioFile, cue: Cue, world?: AudienceGroup): number {
  const context = world ? (config.worldVolume[world] ?? config.masterVolume) : config.attractVolume
  return clamp01(config.masterVolume * context * cue.gain)
}

/**
 * Whether a cue may sound right now.
 *
 * Three gates, in the order they are cheapest to check: the config switch and
 * the mute button, then brief §54's debounce, then its concurrency cap. The cap
 * drops the new sound rather than stealing from a playing one — a celebration
 * cut off halfway by a tap is worse than a tap nobody hears.
 */
export function shouldPlay(options: {
  enabled: boolean
  muted: boolean
  debounceMs: number
  maxConcurrent: number
  /** When this cue last sounded, in ms on the same clock as `now`. */
  lastPlayedAt?: number
  now: number
  playing: number
}): boolean {
  const { enabled, muted, debounceMs, maxConcurrent, lastPlayedAt, now, playing } = options
  if (!enabled || muted) return false
  if (lastPlayedAt !== undefined && now - lastPlayedAt < debounceMs) return false
  return playing < maxConcurrent
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
