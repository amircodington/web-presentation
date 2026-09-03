"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { kioskConfig } from "@/config/kiosk.config"
import { content } from "@/content/load"
import { toPersianDigits } from "@/lib/format"
import { Button } from "@/components/ui/Button"
import { Chip } from "@/components/ui/Chip"
import { LeadForm } from "@/components/kiosk/LeadForm"
import type { SceneComponentProps } from "@/engine"

/**
 * B2B and B2G tracks, selected by `props.track` in `scenes.json`.
 *
 * No price is shown. Both source briefs are explicit that figures are quoted per
 * engagement — putting a per-student number on a public screen would undercut the
 * conversation the booth exists to start.
 *
 * Two ways out, in order of value to the booth: leave a number for a callback,
 * or take a QR away. The form is the accent button because a head teacher who
 * scans a code at a stand rarely follows it up, and one who has typed a mobile
 * number gets a call.
 */
export function CollaborationScene({ state, camera, props }: SceneComponentProps) {
  const isActive = state === "active"
  const key = String(props.track ?? "schools") as "schools" | "organizations"
  const track = content.collaboration[key]
  const [formOpen, setFormOpen] = useState(false)

  if (!track) return null

  return (
    <div className="scene-surface relative flex h-full w-full flex-col justify-center gap-9 rounded-[48px] px-20 pt-14 pb-[var(--kiosk-chrome-clearance,240px)]">
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
        <div className="flex shrink-0 items-center gap-4">
          <Button variant="ghost" onClick={() => camera.goTo("connect")}>
            {track.cta}
          </Button>
          {kioskConfig.features.leadForm ? (
            <Button onClick={() => setFormOpen(true)}>{track.formCta}</Button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {formOpen ? (
          <LeadForm track={track} trackKey={key} onClose={() => setFormOpen(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
