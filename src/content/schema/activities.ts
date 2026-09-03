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
  /**
   * Asked after the split, before the result — brief §27's "این پول رو تا کی
   * لازم نداری؟".
   *
   * It is what turns the game from "was my split correct" into "was my split
   * consistent with my own horizon", which is the only question the kiosk is
   * allowed to answer: §73 bans investment advice in every world, and a game
   * that grades an allocation is giving exactly that.
   */
  horizon: z
    .object({
      prompt: z.string().min(1),
      options: z
        .array(
          z.object({
            id: z.string().min(1),
            label: z.string().min(1),
            /** How the split is read back against this horizon. */
            verdict: z.object({ title: z.string().min(1), body: z.string().min(1) }),
          }),
        )
        .min(2),
    })
    .optional(),
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

/**
 * A short run of scenario questions that builds a profile — the mechanic behind
 * both "چالش هوش مالی" and the adults' decision profile.
 *
 * Every option scores across several `dimensions` rather than being right or
 * wrong, which is the difference between a quiz and a profile. Brief §30 wants a
 * teenager to see *which kind* of decision-maker they are, and brief §42 wants an
 * adult to see six bars rather than one number — the same shape serves both,
 * because "how many did you get right" is the wrong question for either.
 */
const ProfileGameSchema = z
  .object({
    kind: z.literal("profile"),
    prompt: z.string().min(1),
    dimensions: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1), icon: IconNameSchema }))
      .min(2),
    /**
     * Where the questions come from instead of being written here.
     *
     * The adults' bank lives in its own file so the team can retire a scenario
     * and write a new one without touching a game's mechanics — brief §57. A
     * game names the source; `content/select.ts` resolves it.
     */
    questionSource: z.literal("adult-scenarios").optional(),
    questions: z
      .array(
        z.object({
          id: z.string().min(1),
          prompt: z.string().min(1),
          /** The situation the question is asked inside, when it needs one. */
          scenario: z.string().optional(),
          options: z
            .array(
              z.object({
                id: z.string().min(1),
                label: z.string().min(1),
                icon: IconNameSchema,
                detail: z.string().optional(),
                /** Points per dimension id. An absent dimension scores nothing. */
                scores: z.record(z.string().min(1), z.number().int().min(0)),
              }),
            )
            .min(2),
          /** Shown after the answer. The teaching, not a verdict. */
          insight: z.string().min(1),
        }),
      )
      .min(4)
      .optional(),
    /** Bands over the total percentage, cheapest first. */
    levels: z
      .array(
        z.object({
          minScore: z.number().int().min(0).max(100),
          label: z.string().min(1),
          message: z.string().min(1),
        }),
      )
      .min(2),
    /** Named per world: a teenager gets a score, an adult gets a profile. */
    resultTitle: z.string().min(1),
    /**
     * The closing read-back: what you did well, what to look at, and the order
     * to think in. Brief §43 — an adult who sees only bars has been measured;
     * an adult who is told which bar to look at first has been taught something.
     *
     * The two labels are templates: `{dimension}` is replaced with the name of
     * the highest and lowest dimension, so the copy stays true whichever they are.
     */
    conclusion: z
      .object({
        strength: z.string().min(1),
        improve: z.string().min(1),
        framework: z.string().min(1),
      })
      .optional(),
    /** Brief §43: an educational result is not investment advice, and says so. */
    disclaimer: z.string().optional(),
  })
  .superRefine((game, ctx) => {
    if ((game.questions === undefined) === (game.questionSource === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "a profile needs either its own `questions` or a `questionSource`, not both",
      })
    }

    const dimensionIds = new Set(game.dimensions.map((dimension) => dimension.id))
    for (const question of game.questions ?? []) {
      for (const option of question.options) {
        for (const id of Object.keys(option.scores)) {
          if (!dimensionIds.has(id)) {
            ctx.addIssue({
              code: "custom",
              message: `question "${question.id}" option "${option.id}" scores unknown dimension "${id}"`,
            })
          }
        }
      }
    }
    // A profile with no band starting at zero leaves the lowest scorer with no
    // result at all, which is the visitor who most needs one.
    if (!game.levels.some((level) => level.minScore === 0)) {
      ctx.addIssue({ code: "custom", message: "levels must include a band starting at 0" })
    }
  })

/**
 * Rebalance a household budget under pressure — "قدرت خریدت چقدر مقاومه؟".
 *
 * The shock is applied to the essentials rather than announced as a number, per
 * brief §58: a percentage printed on screen has a shelf life measured in weeks,
 * while "essential costs have risen" stays true and stays useful.
 */
const BudgetGameSchema = z
  .object({
    kind: z.literal("budget"),
    prompt: z.string().min(1),
    income: z.number().int().positive(),
    unit: z.string().min(1),
    lines: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          icon: IconNameSchema,
          amount: z.number().int().nonnegative(),
          /** Essentials take the shock; only the rest can be cut to nothing. */
          essential: z.boolean(),
          /** The least this line can realistically go to. */
          floor: z.number().int().nonnegative(),
        }),
      )
      .min(5),
    shock: z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      /** Multiplier applied to every essential line. */
      essentialMultiplier: z.number().min(1),
    }),
    question: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          icon: IconNameSchema,
          verdict: z.object({ title: z.string().min(1), body: z.string().min(1) }),
        }),
      )
      .min(3),
    /** Named so the closing copy can talk about the gap the player left. */
    bufferLabel: z.string().min(1),
    /**
     * What to say about the budget the player actually built, keyed by the rule
     * ids `lib/games/budget.ts` returns.
     *
     * The game used to score only the multiple-choice question that follows, so
     * two people who had done opposite things to the same budget were told the
     * same thing. Brief §9.3 wants the result to be about this visitor.
     */
    findings: z.record(
      z.string().min(1),
      z.object({ title: z.string().min(1), body: z.string().min(1) }),
    ),
  })
  .superRefine((game, ctx) => {
    for (const line of game.lines) {
      if (line.floor > line.amount) {
        ctx.addIssue({ code: "custom", message: `line "${line.id}" has a floor above its amount` })
      }
    }
  })

/** Guess what an instalment plan really costs — "قسط واقعاً ارزون‌تره؟". */
const InstalmentGameSchema = z.object({
  kind: z.literal("instalment"),
  prompt: z.string().min(1),
  unit: z.string().min(1),
  item: z.string().min(1),
  cashPrice: z.number().int().positive(),
  deposit: z.number().int().nonnegative(),
  instalments: z.number().int().positive(),
  monthly: z.number().int().positive(),
  /** The guesses offered, one of which is the real total. */
  guesses: z.array(z.number().int().positive()).min(3),
  reveal: z.object({ title: z.string().min(1), body: z.string().min(1) }),
  /** Round two: the same plan as a share of monthly income. */
  burden: z.object({
    prompt: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          verdict: z.object({ title: z.string().min(1), body: z.string().min(1) }),
        }),
      )
      .min(2),
  }),
  /**
   * The answer to the question the game raises and used to leave hanging: is
   * paying by instalment a good idea here, and if not, what does one do instead?
   *
   * Deliberately conditions and alternatives rather than a verdict on the plan
   * itself. §2 bans financial advice in every world, and "do not buy this" is
   * advice — "these are the conditions under which the arithmetic works, and
   * these are the other moves available" is the structure a visitor can apply to
   * a purchase this kiosk knows nothing about.
   */
  closing: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    /** When the plan is defensible. Read as a checklist, not as permission. */
    goodWhen: z.array(z.string().min(1)).min(2),
    insteadTitle: z.string().min(1),
    /** Moves available when the checklist does not hold. */
    instead: z.array(z.string().min(1)).min(2),
  }),
})

const GameSchema = z.discriminatedUnion("kind", [
  AllocationGameSchema,
  MarketGameSchema,
  JudgementGameSchema,
  SortGameSchema,
  ShopGameSchema,
  StallGameSchema,
  ProfileGameSchema,
  BudgetGameSchema,
  InstalmentGameSchema,
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
export type ProfileGame = z.infer<typeof ProfileGameSchema>
export type BudgetGame = z.infer<typeof BudgetGameSchema>
export type InstalmentGame = z.infer<typeof InstalmentGameSchema>
