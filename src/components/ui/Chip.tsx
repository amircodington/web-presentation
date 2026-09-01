import { Icon } from "./Icon"
import type { IconName } from "@/content/schema/common"

/** Face, notch and glyph colours for each chip denomination. */
const TONES = {
  accent: { face: "var(--kiosk-accent)", notch: "var(--kiosk-on-accent)", glyph: "var(--kiosk-on-accent)" },
  money: { face: "var(--kiosk-money)", notch: "var(--kiosk-card)", glyph: "var(--kiosk-card-text)" },
  positive: { face: "var(--kiosk-positive)", notch: "var(--kiosk-card)", glyph: "var(--kiosk-card-text)" },
  joy: { face: "var(--kiosk-joy)", notch: "var(--kiosk-card)", glyph: "var(--kiosk-on-accent)" },
  paper: { face: "var(--kiosk-card)", notch: "var(--kiosk-accent)", glyph: "var(--kiosk-card-text)" },
  board: { face: "var(--kiosk-bg)", notch: "var(--kiosk-money)", glyph: "var(--kiosk-card-text)" },
} as const

export type ChipTone = keyof typeof TONES

interface ChipProps {
  icon?: IconName
  /** Shown instead of an icon. For a count, a percentage, or a slot time. */
  label?: string
  tone?: ChipTone
  size?: number
  className?: string
}

/**
 * A plastic counter off the booth's own game board.
 *
 * This is the kiosk's one repeated object: it carries every icon, every token in
 * the allocation game, and every step marker. The notched rim is what makes it
 * read as a physical piece rather than a circular div, and it is the visual link
 * between the screen and the table two metres away — a visitor who has just
 * pushed these chips around recognises them here.
 */
export function Chip({ icon, label, tone = "paper", size = 96, className = "" }: ChipProps) {
  const { face, notch, glyph } = TONES[tone]
  const rim = `color-mix(in oklab, ${notch} 62%, ${face})`
  const groove = `color-mix(in oklab, ${notch} 28%, ${face})`

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        color: glyph,
        background: [
          // The face, with one concentric groove pressed into it.
          `radial-gradient(circle closest-side, ${face} 0 60%, ${groove} 60% 64%, ${face} 64% 79%, transparent 79%)`,
          // The notched rim, showing only in the band the face leaves uncovered.
          `repeating-conic-gradient(from 9deg, ${rim} 0deg 9deg, ${face} 9deg 30deg)`,
        ].join(","),
        // Drawn in ink and sitting on its own hard shadow, like every other piece.
        boxShadow: `0 0 0 ${Math.max(2, Math.round(size * 0.045))}px var(--kiosk-border), ${Math.round(size * 0.07)}px ${Math.round(size * 0.07)}px 0 0 var(--kiosk-border)`,
      }}
    >
      {icon ? <Icon name={icon} size={Math.round(size * 0.46)} /> : null}
      {label ? (
        <span
          className="font-bold tabular-nums"
          style={{ fontSize: Math.round(size * 0.3), lineHeight: 1 }}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}
