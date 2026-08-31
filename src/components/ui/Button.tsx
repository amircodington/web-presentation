"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  /**
   * `accent` is the one "touch this" on a screen. `ghost` sits on the board,
   * `paper` sits on a mat — the two grounds need opposite polarity to stay legible.
   */
  variant?: "accent" | "ghost" | "paper"
  className?: string
}

/**
 * The kiosk's only interactive primitive.
 *
 * The 88px minimum height is not a style choice: it is the smallest target a
 * thumb reliably hits on glass at standing height. Press feedback is the most
 * important animation in the product — a visitor who taps and sees nothing taps
 * again, and the kiosk then has two navigations queued.
 */
export function Button({ children, onClick, variant = "accent", className = "" }: ButtonProps) {
  const base =
    "inline-flex min-h-[88px] cursor-pointer items-center justify-center gap-4 rounded-full px-11 text-[32px] font-semibold transition-colors duration-[var(--duration-instant)]"
  const skin = {
    accent:
      "bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)] shadow-[0_10px_0_-2px_color-mix(in_oklab,var(--kiosk-accent)_55%,black),0_26px_50px_-22px_var(--kiosk-accent)]",
    ghost:
      "border-2 border-[var(--kiosk-border)] bg-[color-mix(in_oklab,var(--kiosk-surface)_75%,black)] text-[var(--kiosk-text)]",
    paper:
      "border-2 border-[color-mix(in_oklab,var(--kiosk-card-text)_18%,transparent)] bg-transparent text-[var(--kiosk-card-text)]",
  }[variant]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      className={`${base} ${skin} ${className}`}
    >
      {children}
    </motion.button>
  )
}
