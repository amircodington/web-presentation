import { z } from "zod"

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb hex colour")

export const BrandSchema = z.object({
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  tagline: z.string().min(1),
  logo: z.string().startsWith("/"),
  logoMark: z.string().startsWith("/"),
  colors: z.object({
    /** The table the game is played on. Everything else sits on top of it. */
    background: HexColor,
    /** Raised panel green — the board, one step above the table. */
    surface: HexColor,
    /**
     * Card fill. Light on purpose: every line a visitor has to *read* sits on a
     * paper mat, the way the player cards sit on the table at the stand.
     */
    card: HexColor,
    /** Hairline between cards and their ground. */
    border: HexColor,
    /** Exactly one accent signals "touch this". Two accents force a decision. */
    accent: HexColor,
    accentSoft: HexColor,
    /** Text and icons placed on top of the accent. */
    onAccent: HexColor,
    /** Text on the table. */
    text: HexColor,
    textMuted: HexColor,
    /** Text on a paper mat, which needs the opposite polarity to `text`. */
    cardText: HexColor,
    cardMuted: HexColor,
    /** Quantity of money: scores, prices, token values. Never an action. */
    money: HexColor,
    /** Growth and correct answers. Never an action either. */
    positive: HexColor,
  }),
})

export type Brand = z.infer<typeof BrandSchema>
