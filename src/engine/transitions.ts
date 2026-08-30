import type { TransitionName } from "./types"

/**
 * A named camera move. `apexScaleFactor` pulls the camera back to a wider framing
 * partway through the flight; `apexAt` is where in normalised time that apex sits.
 *
 * The apex is what makes long jumps legible. A straight interpolation between two
 * distant scenes flies across the intervening canvas at high speed and reads as a
 * glitch — pulling back first, then descending, reads as deliberate movement.
 */
export interface TransitionSpec {
  durationMs: number
  ease: readonly [number, number, number, number]
  apexScaleFactor?: number
  apexAt?: number
}

export const TRANSITIONS: Readonly<Record<TransitionName, TransitionSpec>> = Object.freeze({
  /** Ambient movement within the attract scene. Never fully at rest. */
  drift: { durationMs: 1400, ease: [0.37, 0, 0.63, 1] },

  /** The default. Sibling to sibling, confident and quick to settle. */
  glide: { durationMs: 900, ease: [0.22, 1, 0.36, 1] },

  /** Entering a subsection. The arc that reads as "Prezi". */
  dive: { durationMs: 1100, ease: [0.22, 1, 0.36, 1], apexScaleFactor: 0.45, apexAt: 0.45 },

  /** Quiz question to question. Must feel responsive, not cinematic. */
  snap: { durationMs: 450, ease: [0.16, 1, 0.3, 1] },

  /** Revealing a result or an offer. */
  rise: { durationMs: 1200, ease: [0.16, 1, 0.3, 1], apexScaleFactor: 0.75, apexAt: 0.35 },

  /** Returning to the hub from anywhere on the canvas. */
  home: { durationMs: 1300, ease: [0.22, 1, 0.36, 1], apexScaleFactor: 0.35, apexAt: 0.5 },
})

/** Resolves a transition by name, falling back to `glide` for unknown values. */
export function transitionSpec(name: TransitionName | undefined): TransitionSpec {
  return TRANSITIONS[name ?? "glide"] ?? TRANSITIONS.glide
}
