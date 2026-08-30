"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "accent" | "ghost"
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
    "min-h-[88px] rounded-2xl px-10 text-[32px] font-semibold transition-colors duration-[var(--duration-instant)]"
  const skin =
    variant === "accent"
      ? "bg-[var(--kiosk-accent)] text-[#12160f] shadow-[0_18px_60px_-20px_var(--kiosk-accent)]"
      : "border-2 border-white/15 bg-white/5 text-[var(--kiosk-text)]"

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
