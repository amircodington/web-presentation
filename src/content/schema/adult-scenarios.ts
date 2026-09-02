import { z } from "zod"
import { IconNameSchema } from "./common"

/**
 * The adults' question bank, kept in its own file and its own shape.
 *
 * Brief §57 asks for exactly this: the team must be able to retire a scenario
 * and write a new one without a developer and without a rebuild of anything but
 * the content. So the bank is not embedded in `activities.json` alongside a
 * game's mechanics — it is a list the adults' profile draws its questions from,
 * and `lastUpdated` is there so anyone opening the file can see how stale it is.
 *
 * `note` is addressed to whoever opens the file next. It is content for a human,
 * which is the only kind of comment a JSON file can carry.
 */
export const AdultScenariosSchema = z.object({
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  note: z.string().min(1),
  scenarios: z
    .array(
      z.object({
        id: z.string().min(1),
        prompt: z.string().min(1),
        scenario: z.string().min(1),
        options: z
          .array(
            z.object({
              id: z.string().min(1),
              label: z.string().min(1),
              icon: IconNameSchema,
              detail: z.string().optional(),
              scores: z.record(z.string().min(1), z.number().int().min(0)),
            }),
          )
          .min(2),
        insight: z.string().min(1),
      }),
    )
    .min(4),
})

export type AdultScenariosFile = z.infer<typeof AdultScenariosSchema>
