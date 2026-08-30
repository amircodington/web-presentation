import { z } from "zod"

const TransitionNameSchema = z.enum(["drift", "glide", "dive", "snap", "rise", "home"])

const ScenePlacementSchema = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number().positive().default(1),
  rotate: z.number().min(-15).max(15).default(0),
})

const SceneNodeSchema = z.object({
  id: z.string().min(1),
  component: z.string().min(1),
  camera: ScenePlacementSchema,
  transition: TransitionNameSchema.default("glide"),
  next: z.string().optional(),
  back: z.string().optional(),
  meta: z.object({ idleReturn: z.boolean().optional() }).optional(),
  /** Passed verbatim to the scene component, so one component can serve many scenes. */
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
})

/**
 * The scene graph. This is the file that makes the presentation itself dynamic:
 * reordering the show, adding a scene, or changing a camera move is a JSON edit.
 *
 * Structural invariants are checked here rather than at runtime, because a
 * dangling `next` reference is a dead end on an unattended screen.
 */
export const ScenesSchema = z
  .object({
    designSize: z.object({ width: z.number().positive(), height: z.number().positive() }),
    initialScene: z.string().min(1),
    scenes: z.array(SceneNodeSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>()
    for (const scene of value.scenes) {
      if (ids.has(scene.id)) {
        ctx.addIssue({ code: "custom", message: `duplicate scene id "${scene.id}"` })
      }
      ids.add(scene.id)
    }

    if (!ids.has(value.initialScene)) {
      ctx.addIssue({ code: "custom", message: `initialScene "${value.initialScene}" does not exist` })
    }

    for (const scene of value.scenes) {
      for (const edge of ["next", "back"] as const) {
        const target = scene[edge]
        if (target && !ids.has(target)) {
          ctx.addIssue({ code: "custom", message: `scene "${scene.id}".${edge} → unknown "${target}"` })
        }
      }
    }

    const idleReturns = value.scenes.filter((scene) => scene.meta?.idleReturn)
    if (idleReturns.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: `exactly one scene must set meta.idleReturn; found ${idleReturns.length}`,
      })
    }
  })

export type ScenesFile = z.infer<typeof ScenesSchema>
