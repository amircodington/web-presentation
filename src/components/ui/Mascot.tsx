import type { ReactNode } from "react"

/**
 * The club's cast: the six places money can go, drawn as characters, plus the
 * coin itself.
 *
 * They exist because a nine-year-old will not weigh "پس‌انداز نقدی" against
 * "بورس / صندوق" as labels, but will absolutely notice that one character looks
 * delighted and the other looks queasy. The expression is the feedback channel —
 * the games change it as the board changes, so a child reads the consequence of a
 * choice before reading a word of the explanation.
 */
export type MascotName =
  | "coin"
  | "piggy"
  | "bag"
  | "ingot"
  | "rocket"
  | "shop"
  | "book"
  | "sprout"

/** How a character is feeling about what the player just did to it. */
export type MascotMood = "idle" | "happy" | "worried" | "dizzy" | "wow"

interface Body {
  /** Drawn under the face, in the character's own tone. */
  shape: ReactNode
  /** Face anchor and size, since a rocket's face sits higher than a piggy's. */
  face: { x: number; y: number; scale: number }
  tone: string
}

const TONE = {
  money: "var(--kiosk-money)",
  positive: "var(--kiosk-positive)",
  joy: "var(--kiosk-joy)",
  accent: "var(--kiosk-accent)",
  card: "var(--kiosk-card)",
} as const

/*
 * Bodies are drawn on one 100-unit grid at one ink weight, so the cast reads as
 * one family however they are mixed on a screen.
 */
const BODIES: Record<MascotName, Body> = {
  coin: {
    tone: TONE.money,
    face: { x: 50, y: 52, scale: 1 },
    shape: (
      <>
        <circle cx="50" cy="50" r="38" />
        <circle cx="50" cy="50" r="29" fill="none" />
      </>
    ),
  },
  piggy: {
    tone: TONE.accent,
    face: { x: 44, y: 46, scale: 0.9 },
    shape: (
      <>
        <path d="M22 34 30 20 40 32Z" />
        <ellipse cx="48" cy="52" rx="36" ry="28" />
        <path d="M28 76v10M44 78v8M62 76v10" fill="none" />
        <ellipse cx="82" cy="52" rx="9" ry="11" />
        <path d="M80 48v8M85 48v8" fill="none" stroke="var(--kiosk-border)" />
        <path d="M18 46h-6" fill="none" />
      </>
    ),
  },
  bag: {
    tone: TONE.joy,
    face: { x: 50, y: 58, scale: 0.95 },
    shape: (
      <>
        <path d="M36 34a14 14 0 0 1 28 0" fill="none" />
        <path d="M22 34h56l-6 52H28Z" />
      </>
    ),
  },
  ingot: {
    tone: TONE.money,
    face: { x: 50, y: 60, scale: 0.9 },
    shape: (
      <>
        <path d="M34 26h32l8 18H26Z" />
        <path d="M20 46h60l8 32H12Z" />
      </>
    ),
  },
  rocket: {
    tone: TONE.accent,
    face: { x: 50, y: 44, scale: 0.85 },
    shape: (
      <>
        <path d="M50 10c14 12 20 28 20 44v20H30V54c0-16 6-32 20-44Z" />
        <path d="M30 58 16 74l14 4ZM70 58l14 16-14 4Z" />
        <path d="M40 74h20l-6 16h-8Z" fill="var(--kiosk-money)" />
      </>
    ),
  },
  shop: {
    tone: TONE.positive,
    face: { x: 50, y: 66, scale: 0.85 },
    shape: (
      <>
        <path d="M18 44h64v42H18Z" />
        <path d="M12 44 22 24h56l10 20Z" fill="var(--kiosk-accent)" />
        <path d="M30 24 26 44M50 24v20M70 24l4 20" fill="none" />
      </>
    ),
  },
  book: {
    tone: TONE.joy,
    face: { x: 50, y: 62, scale: 0.8 },
    shape: (
      <>
        <path d="M50 30C42 22 28 20 14 20v54c14 0 28 2 36 10 8-8 22-10 36-10V20c-14 0-28 2-36 10Z" />
        <path d="M50 30v54" fill="none" />
      </>
    ),
  },
  sprout: {
    tone: TONE.positive,
    face: { x: 50, y: 68, scale: 0.8 },
    shape: (
      <>
        <path d="M50 50C50 34 38 22 22 22c0 16 12 28 28 28Z" />
        <path d="M50 50c0-16 12-28 28-28 0 16-12 28-28 28Z" />
        <path d="M50 50v14" fill="none" />
        <path d="M26 64h48l-6 24H32Z" fill="var(--kiosk-money)" />
      </>
    ),
  },
}

/** Eyes and mouth per mood, drawn on a 40-unit box centred on the face anchor. */
function Face({ mood }: { mood: MascotMood }) {
  const ink = "var(--kiosk-border)"
  const common = { stroke: ink, strokeWidth: 3.4, strokeLinecap: "round" as const, fill: "none" }

  if (mood === "happy") {
    return (
      <g>
        <path d="M-13 -4a6 6 0 0 1 10 0M3 -4a6 6 0 0 1 10 0" {...common} />
        <path d="M-9 6a10 10 0 0 0 18 0Z" fill={ink} stroke="none" />
      </g>
    )
  }
  if (mood === "worried") {
    return (
      <g>
        <circle cx="-8" cy="-3" r="3" fill={ink} />
        <circle cx="8" cy="-3" r="3" fill={ink} />
        <path d="M-9 9c3-4 6 4 9 0s6 4 9 0" {...common} transform="translate(-4.5)" />
      </g>
    )
  }
  if (mood === "dizzy") {
    return (
      <g>
        <path d="M-12 -7 -4 1M-4 -7l-8 8M4 -7l8 8M12 -7 4 1" {...common} />
        <circle cx="0" cy="9" r="5" {...common} />
      </g>
    )
  }
  if (mood === "wow") {
    return (
      <g>
        <circle cx="-8" cy="-4" r="5" fill="var(--kiosk-card)" stroke={ink} strokeWidth="3" />
        <circle cx="8" cy="-4" r="5" fill="var(--kiosk-card)" stroke={ink} strokeWidth="3" />
        <circle cx="-8" cy="-4" r="2" fill={ink} />
        <circle cx="8" cy="-4" r="2" fill={ink} />
        <ellipse cx="0" cy="11" rx="6" ry="7" fill={ink} />
      </g>
    )
  }
  return (
    <g>
      <circle cx="-8" cy="-3" r="3.4" fill={ink} />
      <circle cx="8" cy="-3" r="3.4" fill={ink} />
      <path d="M-7 7a8 8 0 0 0 14 0" {...common} />
    </g>
  )
}

interface MascotProps {
  name: MascotName
  mood?: MascotMood
  size?: number
  /** Overrides the character's own tone, for a card that sets its own colour. */
  tone?: string
  className?: string
}

export function Mascot({ name, mood = "idle", size = 120, tone, className = "" }: MascotProps) {
  const body = BODIES[name]
  const { x, y, scale } = body.face

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={tone ?? body.tone}
      stroke="var(--kiosk-border)"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {body.shape}
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <Face mood={mood} />
      </g>
    </svg>
  )
}
