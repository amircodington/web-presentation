import { z } from "zod"

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
        icon: z.string().min(1),
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
  icon: z.string().min(1),
  hook: z.string().min(1),
  mechanic: z.string().min(1),
  learning: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1),
  /** Present when the activity is playable on the screen as well as at the stand. */
  game: GameSchema.optional(),
})

/**
 * The live mini-workshops run at the booth. The kiosk shows what is coming next so
 * the screen advertises the stand's own programme rather than competing with it,
 * and lets a visitor play a short version while they wait.
 */
export const ActivitiesSchema = z.object({
  title: z.string().min(1),
  eventHours: z.string().min(1),
  cadence: z.string().min(1),
  nextSlotLabel: z.string().min(1),
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  activities: z.array(ActivitySchema).min(1),
})

export type Activity = z.infer<typeof ActivitySchema>
export type Game = z.infer<typeof GameSchema>
export type AllocationGame = z.infer<typeof AllocationGameSchema>
export type MarketGame = z.infer<typeof MarketGameSchema>
export type JudgementGame = z.infer<typeof JudgementGameSchema>
