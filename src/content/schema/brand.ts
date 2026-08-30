import { z } from "zod"

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb hex colour")

export const BrandSchema = z.object({
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  tagline: z.string().min(1),
  logo: z.string().startsWith("/"),
  colors: z.object({
    background: HexColor,
    /** Chrome and raised panels. */
    surface: HexColor,
    /** Card fill. Named rather than an alpha of white so themes can invert. */
    card: HexColor,
    /** Hairline between cards and their ground. */
    border: HexColor,
    /** Exactly one accent signals "touch this". Two accents force a decision. */
    accent: HexColor,
    accentSoft: HexColor,
    /** Text and icons placed on top of the accent. */
    onAccent: HexColor,
    text: HexColor,
    textMuted: HexColor,
  }),
})

export type Brand = z.infer<typeof BrandSchema>
