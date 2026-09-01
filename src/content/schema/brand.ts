import { z } from "zod"

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb hex colour")

export const BrandSchema = z.object({
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  tagline: z.string().min(1),
  logo: z.string().startsWith("/"),
  logoMark: z.string().startsWith("/"),
  colors: z.object({
    /** The printed board everything is played on. */
    background: HexColor,
    /** Raised panel, one step above the board. */
    surface: HexColor,
    /** Card fill. Every line a visitor has to *read* sits on one. */
    card: HexColor,
    /**
     * The ink every card is outlined and drawn in. Not a hairline: cards carry a
     * drawn outline and a hard shadow in this colour, which is what makes them
     * read as pieces you could pick up rather than as flat rectangles.
     */
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
    /** The fourth colour, carried by the characters. Play, never information. */
    joy: HexColor,
  }),
})

export type Brand = z.infer<typeof BrandSchema>
