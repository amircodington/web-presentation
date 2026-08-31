"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import type { SceneComponentProps } from "@/engine"

/**
 * B2B and B2G tracks, selected by `props.track` in `scenes.json`.
 *
 * No price is shown. Both source briefs are explicit that figures are quoted per
 * engagement — putting a per-student number on a public screen would undercut the
 * conversation the booth exists to start.
 */
export function CollaborationScene({ state, camera, props }: SceneComponentProps) {
  const isActive = state === "active"
  const key = String(props.track ?? "schools") as "schools" | "organizations"
  const track = content.collaboration[key]

  if (!track) return null

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-9 rounded-[48px] px-20 pt-14 pb-52">
      <div className="flex flex-col gap-4">
        <p className="text-[26px] font-medium text-[var(--kiosk-money)]">{track.title}</p>
        <h2 className="display max-w-[85%] text-[58px] text-balance">{track.heroTitle}</h2>
        <p className="text-[28px] text-[var(--kiosk-muted)]">{track.heroSubtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {track.cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 55 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="mat flex min-h-[290px] flex-col gap-4 rounded-[32px] p-8"
          >
            <Chip label={toPersianDigits(index + 1)} tone="board" size={64} />
            <h3 className="text-[33px] leading-tight font-bold">{card.title}</h3>
            <p className="text-[24px] font-medium text-[var(--kiosk-accent)]">{card.subtitle}</p>
            <p className="text-[23px] leading-relaxed text-[var(--kiosk-card-muted)]">
              {card.detail}
            </p>
          </motion.article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-8">
        <p className="text-[25px] text-[var(--kiosk-muted)]">{track.pricePolicy}</p>
        <Button onClick={() => camera.goTo("connect")}>{track.cta}</Button>
      </div>
    </div>
  )
}
