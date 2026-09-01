"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { formatJalali } from "@/lib/format"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import type { SceneComponentProps } from "@/engine"

/** The festival offer. Renders nothing when the offer is switched off. */
export function OfferScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { festival } = content

  if (!festival.offerActive) {
    return (
      <div className="scene-surface flex h-full w-full items-center justify-center rounded-[48px]">
        <p className="text-[48px] text-[var(--kiosk-muted)]">{festival.name}</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-10 overflow-hidden rounded-[48px] bg-[var(--kiosk-accent)] px-24 pb-60 text-center text-[var(--kiosk-on-accent)]">
      <motion.div
        aria-hidden
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -inset-[40%] opacity-[0.12]"
        style={{
          background:
            "repeating-conic-gradient(var(--kiosk-on-accent) 0deg 10deg, transparent 10deg 20deg)",
        }}
      />

      <Chip icon="gift" tone="paper" size={132} className="relative" />

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="display relative text-[100px]"
      >
        {festival.offerTitle}
      </motion.h2>

      <p className="relative max-w-[70%] text-[38px] font-semibold">{festival.offerDescription}</p>

      {festival.validUntil ? (
        <p className="relative text-[28px] font-medium opacity-75">
          تا {formatJalali(festival.validUntil)}
        </p>
      ) : null}

      <Button
        variant="ghost"
        className="relative !border-[var(--kiosk-on-accent)] !bg-[var(--kiosk-on-accent)] !text-[var(--kiosk-accent)]"
        onClick={() => camera.goTo("quiz-intro")}
      >
        ببین کدام مسیر مناسب توست ←
      </Button>
    </div>
  )
}
