import { describe, expect, it } from "vitest"
import { resolveSrc, resolveVolume, shouldPlay } from "./mixer"
import type { AudioFile, Cue } from "@/content/schema/audio"

const cue = (over: Partial<Cue> = {}): Cue =>
  ({ gain: 1, src: "/audio/ui/tap.wav", ...over }) as Cue

const config: AudioFile = {
  enabled: true,
  masterVolume: 0.5,
  attractVolume: 0.4,
  worldVolume: { kids: 1, teens: 0.5, adults: 0.2 },
  debounceMs: 70,
  maxConcurrent: 2,
  cues: {},
}

describe("resolveSrc", () => {
  it("prefers the world's own voice for the cue", () => {
    const c = cue({ byWorld: { kids: "/audio/kids/pop.wav" } })
    expect(resolveSrc(c, "kids")).toBe("/audio/kids/pop.wav")
  })

  it("falls back to the shared file in a world with no override", () => {
    const c = cue({ byWorld: { kids: "/audio/kids/pop.wav" } })
    expect(resolveSrc(c, "adults")).toBe("/audio/ui/tap.wav")
  })

  it("returns nothing for a caption-only cue, so the subtitle still shows", () => {
    expect(resolveSrc(cue({ src: undefined, subtitle: "آفرین!" }))).toBeUndefined()
  })
})

describe("resolveVolume", () => {
  it("multiplies master, world and cue gain", () => {
    expect(resolveVolume(config, cue({ gain: 0.5 }), "kids")).toBeCloseTo(0.25)
  })

  it("uses the attract volume outside any world", () => {
    expect(resolveVolume(config, cue(), undefined)).toBeCloseTo(0.2)
  })

  it("never exceeds one", () => {
    const loud = { ...config, masterVolume: 1, worldVolume: { kids: 1, teens: 1, adults: 1 } }
    expect(resolveVolume(loud, cue(), "kids")).toBe(1)
  })
})

describe("shouldPlay", () => {
  const base = { enabled: true, muted: false, debounceMs: 70, maxConcurrent: 2, now: 1000, playing: 0 }

  it("plays a cue that has not sounded recently", () => {
    expect(shouldPlay({ ...base, lastPlayedAt: 900 })).toBe(true)
  })

  it("swallows the same cue fired twice inside the debounce window", () => {
    expect(shouldPlay({ ...base, lastPlayedAt: 960 })).toBe(false)
  })

  it("refuses to stack beyond the concurrency cap", () => {
    expect(shouldPlay({ ...base, playing: 2 })).toBe(false)
  })

  it("is silent when muted, and when disabled in content", () => {
    expect(shouldPlay({ ...base, muted: true })).toBe(false)
    expect(shouldPlay({ ...base, enabled: false })).toBe(false)
  })
})
