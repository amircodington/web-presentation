"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { formatJalali } from "@/lib/format"
import { Button } from "@/components/ui/Button"
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
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-12 overflow-hidden rounded-[48px] bg-[var(--kiosk-accent)] px-24 pb-52 text-center text-[#12160f]">
      <motion.div
        aria-hidden
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -inset-[40%] opacity-[0.07]"
        style={{
          background:
            "repeating-conic-gradient(#12160f 0deg 10deg, transparent 10deg 20deg)",
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-[32px] font-bold tracking-[0.2em]"
      >
        {festival.name}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-[110px] leading-[1.1] font-black"
      >
        {festival.offerTitle}
      </motion.h2>

      <p className="relative max-w-[70%] text-[42px] font-semibold">{festival.offerDescription}</p>

      {festival.validUntil ? (
        <p className="relative text-[30px] font-medium opacity-70">
          تا {formatJalali(festival.validUntil)}
        </p>
      ) : null}

      <Button variant="ghost" className="relative !border-[#12160f]/25 !text-[#12160f]" onClick={() => camera.goTo("quiz-intro")}>
        ببین کدام دوره مناسب توست ←
      </Button>
    </div>
  )
}
