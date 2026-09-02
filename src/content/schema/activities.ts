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
  /** The whole chip, not a fragment: a kids pot and a 100M pot say it differently. */
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


/**
 * Sort objects into bins — "نیاز یا خواسته؟".
 *
 * `depends` is the point of the game rather than a third category nobody uses:
 * brief §18 wants a child to learn that a money decision is not always yes or
 * no, so an item marked `depends` is accepted into either bin and answered with
 * "it depends on the situation" instead of a tick or a cross.
 */
const SortGameSchema = z.object({
  kind: z.literal("sort"),
  prompt: z.string().min(1),
  bins: z
    .array(z.object({ id: z.string().min(1), label: z.string().min(1), icon: IconNameSchema }))
    .length(2),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        icon: IconNameSchema,
        /** A bin id, or `depends` when either answer is defensible. */
        verdict: z.string().min(1),
        explain: z.string().min(1),
      }),
    )
    .min(4),
  praise: z.string().min(1),
  dependsNote: z.string().min(1),
})

/** Spend a fixed budget in a shop — "فروشگاه کوچک". */
const ShopGameSchema = z.object({
  kind: z.literal("shop"),
  prompt: z.string().min(1),
  budget: z.number().int().positive(),
  currency: z.string().min(1),
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        icon: IconNameSchema,
        price: z.number().int().positive(),
        /** Marks the things a child actually needs, for the closing feedback. */
        essential: z.boolean(),
      }),
    )
    .min(5),
  /** Shown instead of an error when the basket costs more than the purse holds. */
  shortOfMoney: z.string().min(1),
  feedback: z.record(
    z.string().min(1),
    z.object({ title: z.string().min(1), body: z.string().min(1) }),
  ),
})

/** Run a stall: pick a product, pick a price, meet the customers — "کسب‌وکار کوچولوی من". */
const StallGameSchema = z.object({
  kind: z.literal("stall"),
  prompt: z.string().min(1),
  currency: z.string().min(1),
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        icon: IconNameSchema,
        /** What it costs to make one. Selling below it is the lesson. */
        cost: z.number().int().positive(),
        /** The prices the child may choose between, cheapest first. */
        prices: z.array(z.number().int().positive()).min(3),
      }),
    )
    .min(3),
  /**
   * The queue. Each customer pays up to `willingToPay`, so a price is not right
   * or wrong — it trades how many buy against what each one pays.
   */
  customers: z
    .array(z.object({ name: z.string().min(1), willingToPay: z.number().int().positive() }))
    .min(4),
  reactions: z.object({
    buys: z.string().min(1),
    tooExpensive: z.string().min(1),
    bargain: z.string().min(1),
  }),
  feedback: z.record(
    z.string().min(1),
    z.object({ title: z.string().min(1), body: z.string().min(1) }),
  ),
})

const GameSchema = z.discriminatedUnion("kind", [
  AllocationGameSchema,
  MarketGameSchema,
  JudgementGameSchema,
  SortGameSchema,
  ShopGameSchema,
  StallGameSchema,
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
  /**
   * What finishing this activity earns. Brief §22 makes the celebration
   * mandatory in the kids' world, and a badge is what a child names when they
   * describe the screen to someone else — so the wording is content, not code.
   */
  badge: z
    .object({
      title: z.string().min(1),
      label: z.string().min(1),
      note: z.string().min(1),
    })
    .optional(),
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
export type SortGame = z.infer<typeof SortGameSchema>
export type ShopGame = z.infer<typeof ShopGameSchema>
export type StallGame = z.infer<typeof StallGameSchema>
