"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  /**
   * `accent` is the one "touch this" on a screen. `ghost` sits on the board,
   * `paper` sits on a card — the two grounds need different fills to stay legible.
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
 *
 * So the press is a movement, not a tint: the button travels down-and-into its own
 * hard shadow until the shadow is gone, the way a physical key does. A child sees
 * that from two metres away, which a colour change does not survive.
 */
export function Button({ children, onClick, variant = "accent", className = "" }: ButtonProps) {
  const base =
    "inline-flex min-h-[88px] cursor-pointer items-center justify-center gap-4 rounded-full border-[4px] border-[var(--kiosk-border)] px-11 text-[32px] font-bold"
  const skin = {
    accent: "bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)]",
    ghost: "bg-[var(--kiosk-card)] text-[var(--kiosk-text)]",
    paper: "bg-[var(--kiosk-money)] text-[var(--kiosk-card-text)]",
  }[variant]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ boxShadow: "7px 7px 0 0 var(--kiosk-border)" }}
      whileTap={{ x: 7, y: 7, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
      transition={{ type: "spring", stiffness: 900, damping: 34 }}
      className={`${base} ${skin} ${className}`}
    >
      {children}
    </motion.button>
  )
}
