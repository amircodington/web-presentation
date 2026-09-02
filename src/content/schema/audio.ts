import { z } from "zod"
import { AudienceGroupSchema } from "./common"

const AudioSrcSchema = z.string().startsWith("/audio/", "audio must be served from /public/audio")

/**
 * One thing the kiosk can say, named by meaning rather than by file.
 *
 * A component asks for `tap`, not for `kids/pop.wav`. Which file that resolves
 * to is the world's business — brief §10 makes sound personality part of a
 * world's identity, so the same gesture is a boing in the kids' world and a
 * restrained click in the adults'.
 *
 * `subtitle` is not optional decoration. Brief §55: no instruction may be
 * carried by audio alone, and the experience has to be complete with the sound
 * off. A cue with a subtitle and no `src` is therefore valid and useful — it is
 * a line the team has written but not yet recorded, and the caption still shows.
 */
const CueSchema = z
  .object({
    src: AudioSrcSchema.optional(),
    /** Per-world overrides. Anything unlisted falls back to `src`. */
    byWorld: z.partialRecord(AudienceGroupSchema, AudioSrcSchema).optional(),
    /** Per-cue trim, applied on top of the master and world volumes. */
    gain: z.number().min(0).max(1).default(1),
    subtitle: z.string().min(1).optional(),
  })
  .refine((cue) => cue.src !== undefined || cue.subtitle !== undefined, {
    message: "a cue must have a src, a subtitle, or both",
  })

/**
 * The kiosk's whole sound design, in one file.
 *
 * Volumes are per world because the three worlds are heard at different
 * distances and by different people: brief §54's recommended booth setting is a
 * loud kids' world, a moderate teens' world, and an adults' world you have to be
 * standing at the screen to hear.
 */
export const AudioSchema = z.object({
  enabled: z.boolean(),
  masterVolume: z.number().min(0).max(1),
  /** Used by the attract loop, which belongs to no world. */
  attractVolume: z.number().min(0).max(1),
  worldVolume: z.record(AudienceGroupSchema, z.number().min(0).max(1)),
  /**
   * How long the same cue is ignored after firing. Two fingers on a 55" screen
   * is normal, and the same sound twice a frame apart is a click, not a sound.
   */
  debounceMs: z.number().int().positive(),
  /** Brief §54: sound stacking is banned. */
  maxConcurrent: z.number().int().positive(),
  cues: z.record(z.string().min(1), CueSchema),
})

export type AudioFile = z.infer<typeof AudioSchema>
export type Cue = z.infer<typeof CueSchema>
export type CueId = string
