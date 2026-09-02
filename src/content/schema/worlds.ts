import { z } from "zod"
import { AudienceGroupSchema, AudienceIdSchema, IconNameSchema } from "./common"

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb hex colour")

/**
 * A world's palette. Every key in `brand.json` that a world is allowed to
 * override, and no others: the logo, the ink weight and the card silhouette stay
 * shared, because the three worlds are three rooms in one building rather than
 * three products.
 */
const WorldPaletteSchema = z.object({
  background: HexColor,
  surface: HexColor,
  card: HexColor,
  border: HexColor,
  accent: HexColor,
  accentSoft: HexColor,
  onAccent: HexColor,
  text: HexColor,
  textMuted: HexColor,
  cardText: HexColor,
  cardMuted: HexColor,
  money: HexColor,
  positive: HexColor,
  joy: HexColor,
})

/**
 * One of the four experiences a world offers.
 *
 * `active` is a switch, not a placeholder: an experience whose scene is not yet
 * built, or which the team wants off for one event, is declared here and simply
 * not offered. The world home renders what is on and never a dead card.
 */
const WorldExperienceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  icon: IconNameSchema,
  /** Scene id in `scenes.json`. Cross-checked by the loader. */
  scene: z.string().min(1),
  active: z.boolean(),
})

const WorldSchema = z.object({
  id: AudienceGroupSchema,
  /** What the gateway card says. Brief §7 fixes this wording. */
  display: z.string().min(1),
  subtext: z.string().min(1),
  icon: IconNameSchema,
  /** What this world's portal says while the attract loop is passing through it. */
  attractLine: z.string().min(1),
  /** The world home's own headline, once the visitor is inside. */
  headline: z.string().min(1),
  intro: z.string().min(1),
  /** Which catalogue audiences this world's product reveal draws from. */
  audiences: z.array(AudienceIdSchema).min(1),
  /**
   * Cue sounded on arrival in this world. Brief §51 recommends a spoken greeting
   * for the kids' world specifically, because some children read slowly and a
   * screen that only writes its welcome has not welcomed them. Its caption is in
   * `audio.json` beside it, so the line reaches a muted screen too.
   */
  greetingCue: z.string().min(1).optional(),
  palette: WorldPaletteSchema,
  experiences: z.array(WorldExperienceSchema).length(4),
  /**
   * The world's diagnostic — the test that produces a result, as distinct from an
   * experience that produces a lesson. Brief §12 keeps the two separate: a visitor
   * plays one experience and takes one diagnostic, and only the diagnostic is
   * allowed to say something about them.
   */
  diagnostic: WorldExperienceSchema.optional(),
  /**
   * One question that re-files the visitor into a narrower catalogue audience.
   *
   * Brief §44: "امسال کنکور دادی؟" is the only thing that separates a
   * school-leaver from every other adult, and it decides whether +18 leads the
   * reveal. It is deliberately one question on the world home rather than a
   * fourth world — §45 is explicit that +18 must not be pushed at children.
   */
  qualifier: z
    .object({
      prompt: z.string().min(1),
      options: z
        .array(z.object({ label: z.string().min(1), audience: AudienceIdSchema }))
        .min(2),
    })
    .optional(),
  /**
   * Where this world's products are shown. Brief §46: the reveal comes *after*
   * a result, never before an experience, so it is a scene the world points at
   * rather than a card on the world home.
   */
  reveal: z
    .object({
      scene: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
      topics: z.array(z.string().min(1)).min(1),
      cta: z.string().min(1),
    })
    .optional(),
})

/**
 * The three worlds, and the gateway that leads into them.
 *
 * This file is the spine of the redesign: the first interactive decision is which
 * world you are in, and everything downstream — palette, experiences, product
 * order — hangs off that one choice. School and organisation are deliberately not
 * a fourth world; they are the secondary route below the three cards, because a
 * B2B visitor is not looking for a game.
 */
export const WorldsSchema = z.object({
  gateway: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    secondary: z.object({
      question: z.string().min(1),
      cta: z.string().min(1),
      scene: z.string().min(1),
    }),
  }),
  worlds: z.array(WorldSchema).length(3),
})

export type WorldsFile = z.infer<typeof WorldsSchema>
export type World = z.infer<typeof WorldSchema>
export type WorldExperience = z.infer<typeof WorldExperienceSchema>
export type WorldPalette = z.infer<typeof WorldPaletteSchema>
