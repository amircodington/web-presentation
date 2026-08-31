import { z } from "zod"
import { IconNameSchema } from "./common"

/**
 * Divide a fixed pot between competing options — the mechanic behind both
 * "چالش ۱۰۰ میلیون" and "سبدت رو بچین".
 *
 * `risk` and `growth` are what the feedback rules in `lib/games/allocation.ts`
 * reason over, so a new option is a content edit rather than a code change.
 */
const AllocationGameSchema = z.object({
  kind: z.literal("allocation"),
  prompt: z.string().min(1),
  scenario: z.string().optional(),
  tokens: z.number().int().positive(),
  tokenLabel: z.string().min(1),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        icon: IconNameSchema,
        risk: z.enum(["none", "low", "medium", "high"]),
        /** Whether this option can grow in value, for the opportunity-cost rule. */
        growth: z.boolean(),
      }),
    )
    .min(3),
  /** Feedback text keyed by the rule id the evaluator returns. */
  feedback: z.record(
    z.string().min(1),
    z.object({ title: z.string().min(1), body: z.string().min(1) }),
  ),
})

/** Predict how news moves a price — "راز نوسان قیمت". */
const MarketGameSchema = z.object({
  kind: z.literal("market"),
  prompt: z.string().min(1),
  startPrice: z.number().int().positive(),
  unit: z.string().min(1),
  rounds: z
    .array(
      z.object({
        news: z.string().min(1),
        /** Which way supply and demand actually push the price. */
        effect: z.enum(["up", "down"]),
        change: z.number().int().positive(),
        explain: z.string().min(1),
      }),
    )
    .min(2),
})

/** Judge each offer green or red — "فرصته یا کلاهبرداری؟". */
const JudgementGameSchema = z.object({
  kind: z.literal("judgement"),
  prompt: z.string().min(1),
  safeLabel: z.string().min(1),
  riskyLabel: z.string().min(1),
  scenarios: z
    .array(
      z.object({
        text: z.string().min(1),
        verdict: z.enum(["safe", "risky"]),
        explain: z.string().min(1),
      }),
    )
    .min(2),
})

const GameSchema = z.discriminatedUnion("kind", [
  AllocationGameSchema,
  MarketGameSchema,
  JudgementGameSchema,
])

const ActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  durationMin: z.number().int().positive(),
  icon: IconNameSchema,
  hook: z.string().min(1),
  mechanic: z.string().min(1),
  learning: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1),
  /** Present when the activity is playable on the screen as well as at the stand. */
  game: GameSchema.optional(),
})

/**
 * The catalogue of mini-activities the booth can run. When each one is actually on
 * belongs to `event.json`, so taking the same activities to a different event is a
 * schedule edit rather than a rewrite of this file.
 */
export const ActivitiesSchema = z.object({
  title: z.string().min(1),
  activities: z.array(ActivitySchema).min(1),
})

export type Activity = z.infer<typeof ActivitySchema>
export type Game = z.infer<typeof GameSchema>
export type AllocationGame = z.infer<typeof AllocationGameSchema>
export type MarketGame = z.infer<typeof MarketGameSchema>
export type JudgementGame = z.infer<typeof JudgementGameSchema>
