import type { IconName } from "@/content/schema/common"

/**
 * The kiosk's icon set, drawn on one 24-unit grid.
 *
 * Every glyph is stroked in `currentColor` at a single weight so a row of icons
 * reads as one family and any of them can be tinted to match a state. Emoji
 * cannot do either: the platform picks their colour and weight, and at this size
 * they read as clip art pasted onto the design.
 *
 * The vocabulary is the booth's own — a board, chips, banknotes, a candlestick,
 * an open book — rather than generic finance symbolism.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  student: (
    <>
      <path d="M5.5 11.5a6.5 6.5 0 0 1 13 0V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19v-7.5Z" />
      <path d="M5.5 14.75h13" />
      <path d="M9.75 17.5h4.5" />
      <path d="M10 7.25a2.25 2.25 0 0 1 4 0" />
    </>
  ),
  parent: (
    <>
      <circle cx="8.5" cy="6.5" r="2.75" />
      <path d="M3.5 20v-1.5a5 5 0 0 1 10 0V20" />
      <circle cx="17" cy="10" r="2.25" />
      <path d="M13.5 20v-1a3.5 3.5 0 0 1 7 0v1" />
    </>
  ),
  konkur: (
    <>
      <path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z" />
      <path d="M6.5 10.5V15c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-4.5" />
      <path d="M21 8.5V14" />
    </>
  ),
  school: (
    <>
      <path d="M3.5 10.5 12 4.5l8.5 6" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M10 20v-5h4v5" />
      <path d="M12 4.5V2.5" />
    </>
  ),
  organization: (
    <>
      <path d="M4 20V6.5h8V20" />
      <path d="M12 20V10h8v10" />
      <path d="M6.75 9.5h2.5M6.75 13h2.5M6.75 16.5h2.5M15 13.5h2.5M15 17h2.5" />
      <path d="M2.5 20h19" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 18a8.5 8.5 0 1 1 17 0" />
      <path d="m12 18 4.5-6" />
      <circle cx="12" cy="18" r="1.5" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="7" rx="7.5" ry="3" />
      <path d="M4.5 7v5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V7" />
      <path d="M4.5 12v5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-5" />
    </>
  ),
  chart: (
    <>
      <path d="M3 20h18" />
      <path d="M7 16V9M7 6.5v2.5M7 16v2" />
      <path d="M4.75 9h4.5v7h-4.5z" />
      <path d="M16.5 14V7M16.5 4.5V7M16.5 14v2.5" />
      <path d="M14.25 7h4.5v7h-4.5z" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21V3.5" />
      <path d="M6 4.5h10.5l-2.25 3.75L16.5 12H6" />
    </>
  ),
  basket: (
    <>
      <path d="M3.5 9.5h17l-1.75 9.25a1.5 1.5 0 0 1-1.5 1.25H6.75a1.5 1.5 0 0 1-1.5-1.25L3.5 9.5Z" />
      <path d="M8 9.5a4 4 0 0 1 8 0" />
      <path d="M9.75 13v3.5M14.25 13v3.5" />
    </>
  ),
  spend: (
    <>
      <path d="M5.5 8h13l1 12h-15l1-12Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  save: (
    <>
      <rect x="3.5" y="5.5" width="17" height="14" rx="2" />
      <circle cx="12" cy="12.5" r="3.25" />
      <path d="M12 9.25v6.5M8.75 12.5h6.5" />
    </>
  ),
  gold: (
    <>
      <path d="M8 6.5h8l1.5 4h-11l1.5-4Z" />
      <path d="M4.5 12.5h9l1.5 5h-12l1.5-5Z" />
      <path d="M15.5 12.5h4l1.5 5h-4" />
    </>
  ),
  market: (
    <>
      <path d="M3.5 20V4" />
      <path d="M3.5 20h17" />
      <path d="m6.5 15.5 4-4.5 3 2.5 5.5-6.5" />
      <path d="M15.5 7h4v4" />
    </>
  ),
  business: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
      <path d="M8.75 7.5v-2a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 1.5 1.5v2" />
      <path d="M3 13h18" />
      <path d="M10.5 13v2h3v-2" />
    </>
  ),
  education: (
    <>
      <path d="M12 7.5v12" />
      <path d="M12 7.5C10.5 6 8 5.25 3.5 5.25v12C8 17.25 10.5 18 12 19.5" />
      <path d="M12 7.5c1.5-1.5 4-2.25 8.5-2.25v12c-4.5 0-7 .75-8.5 2.25" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.75" />
      <path d="M6 10v4M18 10v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.25l3.5 2" />
    </>
  ),
  play: <path d="M8 5.5 19 12 8 18.5v-13Z" />,
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h3v3h-3zM17.5 17.5h3v3h-3zM14 20.5h.01M20.5 14h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
    </>
  ),
  telegram: (
    <>
      <path d="M21 4 3 11.5l6 2.25L21 4Z" />
      <path d="M21 4 9 13.75V20l3.75-4.25L21 4Z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8L7 21v-4.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" />
      <path d="M7 11h.01M12 11h.01M17 11h.01" />
    </>
  ),
  sound: (
    <>
      <path d="M11 5.5 6.5 9H3.5v6h3L11 18.5v-13Z" />
      <path d="M14.75 9.25a3.75 3.75 0 0 1 0 5.5" />
      <path d="M17.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  mute: (
    <>
      <path d="M11 5.5 6.5 9H3.5v6h3L11 18.5v-13Z" />
      <path d="m15 9.5 5 5" />
      <path d="m20 9.5-5 5" />
    </>
  ),
  /*
   * The things a child sorts, buys and sells. They are drawn at the same weight
   * as the rest of the set rather than as illustrations, so a row mixing a bike
   * with a chart still reads as one family — and so any of them can be tinted to
   * mark a verdict, which is how the sorting game gives its feedback.
   */
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1v13a2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 15.5v-10Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2.5 2.5 0 0 0-2 1v13a2.5 2.5 0 0 1 2-1h4.5a1.5 1.5 0 0 0 1.5-1.5v-10Z" />
    </>
  ),
  water: (
    <>
      <path d="M12 3.5c3.5 4 5.5 6.6 5.5 9.4a5.5 5.5 0 0 1-11 0c0-2.8 2-5.4 5.5-9.4Z" />
      <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  food: (
    <>
      <path d="M4 10.5h16a8 8 0 0 1-8 7 8 8 0 0 1-8-7Z" />
      <path d="M3 20.5h18" />
      <path d="M8.5 7V4.5" />
      <path d="M12 7V4" />
      <path d="M15.5 7V4.5" />
    </>
  ),
  shoe: (
    <>
      <path d="M2.5 16.5V10h4l2.5 2.5h4.5c3.5 0 8 1.4 8 4v2h-19a2 2 0 0 1-2-2Z" />
      <path d="M6.5 10v3" />
      <path d="M10.5 13v3" />
    </>
  ),
  toy: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.75" />
      <path d="M12 4v5.25" />
      <path d="m18.9 16-4.5-2.6" />
      <path d="m5.1 16 4.5-2.6" />
    </>
  ),
  console: (
    <>
      <path d="M6.5 8.5h11a4.5 4.5 0 0 1 0 9h-11a4.5 4.5 0 0 1 0-9Z" />
      <path d="M8 11v3" />
      <path d="M6.5 12.5h3" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="18" cy="14" r="1" />
    </>
  ),
  icecream: (
    <>
      <path d="M8 10.5a4 4 0 0 1 8 0" />
      <path d="M7 10.5h10L12 21 7 10.5Z" />
      <path d="M8.5 14h7" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="16.5" r="3.5" />
      <circle cx="18" cy="16.5" r="3.5" />
      <path d="M6 16.5 10 8h5l3 8.5" />
      <path d="M9 8h4" />
      <path d="M10 16.5h6" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8.5h14l-1 11.5H6L5 8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20.5V16L16.5 3.5 21 8 8.5 20.5H4Z" />
      <path d="m14.5 5.5 4.5 4.5" />
      <path d="M4 16h4.5v4.5" />
    </>
  ),
  juice: (
    <>
      <path d="M7 7h10l-1.2 12.5a1.5 1.5 0 0 1-1.5 1.4h-4.6a1.5 1.5 0 0 1-1.5-1.4L7 7Z" />
      <path d="M6.5 11h11" />
      <path d="M13 7V3.5h4" />
    </>
  ),
  bracelet: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="4.5" r="1.8" />
      <circle cx="18.6" cy="15.6" r="1.5" />
      <circle cx="5.4" cy="15.6" r="1.5" />
    </>
  ),
  painting: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 15.5 8 11l4 4 3-2.5 5.5 4.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9.5" cy="10" r="1.1" />
      <circle cx="14.5" cy="9.5" r="1.1" />
      <circle cx="12.5" cy="14.5" r="1.1" />
      <circle cx="8.5" cy="14.5" r="1" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="4" rx="1" />
      <path d="M4.5 13v6.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V13" />
      <path d="M12 9v12" />
      <path d="M12 9S10.5 3.5 8 3.5a2.5 2.5 0 0 0 0 5.5M12 9s1.5-5.5 4-5.5a2.5 2.5 0 0 1 0 5.5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  cross: <path d="m6 6 12 12M18 6 6 18" />,
  up: (
    <>
      <path d="m4 17 6-6 3.5 3L20 6.5" />
      <path d="M15 6.5h5v5" />
    </>
  ),
  down: (
    <>
      <path d="m4 7 6 6 3.5-3L20 17.5" />
      <path d="M15 17.5h5v-5" />
    </>
  ),
  spark: (
    <>
      <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z" />
    </>
  ),
  map: (
    <>
      <path d="m2.5 6.5 6-2.5 7 2.5 6-2.5v13l-6 2.5-7-2.5-6 2.5v-13Z" />
      <path d="M8.5 4v13M15.5 6.5v13" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 10.5 8.5-6.5 8.5 6.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.75 20v-5.5h4.5V20" />
    </>
  ),
  /* Journeys read right-to-left, so "back" points right and "next" points left. */
  back: (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  next: (
    <>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
}

/** Icons that read as a solid shape rather than an outline. */
const FILLED: ReadonlySet<IconName> = new Set(["play", "spark"])

interface IconProps {
  name: IconName
  /** Rendered size in px. The stroke scales with it so weight stays even. */
  size?: number
  className?: string
}

export function Icon({ name, size = 48, className = "" }: IconProps) {
  const filled = FILLED.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  )
}
