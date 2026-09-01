"use client"

import { motion } from "motion/react"
import { candles, priceAfter, priceBounds } from "@/lib/games/market"
import { toPersianDigits } from "@/lib/format"
import type { MarketGame } from "@/content/schema/activities"

interface PriceChartProps {
  game: MarketGame
  /** How many headlines have resolved. Candles are drawn for these only. */
  roundsPlayed: number
  unit: string
}

const WIDTH = 1000
const HEIGHT = 210
const PAD_TOP = 14
const PAD_BOTTOM = 38

/**
 * The price, as a candlestick chart that builds one headline at a time.
 *
 * A candle is the right mark here rather than a line, for two reasons. It shows
 * where the price opened *and* closed, which is exactly the "this news moved it
 * this far" the game is teaching. And it is the chart already inside the Wealth
 * Club emblem — a visitor meets the same shape on the logo above the stand, on
 * this screen, and in the +18 syllabus.
 *
 * Rounds not yet played are left as empty slots rather than omitted, so the
 * chart's width does not change under the visitor between answers.
 */
export function PriceChart({ game, roundsPlayed, unit }: PriceChartProps) {
  const { min, max } = priceBounds(game)
  const drawn = candles(game, roundsPlayed)
  const slots = game.rounds.length
  const step = WIDTH / slots
  const bodyWidth = Math.min(74, step * 0.46)

  const y = (price: number) =>
    PAD_TOP + (1 - (price - min) / (max - min)) * (HEIGHT - PAD_TOP - PAD_BOTTOM)
  const x = (index: number) => step * index + step / 2

  const gridLines = [min, (min + max) / 2, max]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label={`نمودار قیمت، اکنون ${priceAfter(game, roundsPlayed)} ${unit}`}
      /* The canvas is a maths space; RTL would mirror the time axis. */
      style={{ direction: "ltr" }}
    >
      {gridLines.map((price) => (
        <g key={price}>
          <line
            x1={0}
            x2={WIDTH}
            y1={y(price)}
            y2={y(price)}
            stroke="var(--kiosk-border)"
            strokeWidth={2}
            strokeOpacity={0.22}
            strokeDasharray="8 10"
          />
          <text
            x={8}
            y={y(price) - 8}
            fontSize={17}
            fill="var(--kiosk-muted)"
            style={{ direction: "rtl" }}
          >
            {toPersianDigits(Math.round(price))}
          </text>
        </g>
      ))}

      <line
        x1={0}
        x2={WIDTH}
        y1={y(game.startPrice)}
        y2={y(game.startPrice)}
        stroke="var(--kiosk-muted)"
        strokeWidth={2}
      />

      {game.rounds.map((_, index) => (
        <text
          key={index}
          x={x(index)}
          y={HEIGHT - 10}
          fontSize={19}
          textAnchor="middle"
          fill={index < roundsPlayed ? "var(--kiosk-text)" : "var(--kiosk-muted)"}
          opacity={index < roundsPlayed ? 1 : 0.45}
        >
          {toPersianDigits(index + 1)}
        </text>
      ))}

      {drawn.map((candle) => {
        const up = candle.direction === "up"
        const colour = up ? "var(--kiosk-positive)" : "var(--kiosk-accent)"
        const top = y(Math.max(candle.open, candle.close))
        const bottom = y(Math.min(candle.open, candle.close))
        return (
          <motion.g
            key={candle.index}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${x(candle.index)}px ${y(candle.open)}px` }}
          >
            <line
              x1={x(candle.index)}
              x2={x(candle.index)}
              y1={top - 11}
              y2={bottom + 11}
              stroke={colour}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <rect
              x={x(candle.index) - bodyWidth / 2}
              y={top}
              width={bodyWidth}
              height={Math.max(6, bottom - top)}
              rx={6}
              fill={colour}
            />
          </motion.g>
        )
      })}
    </svg>
  )
}
