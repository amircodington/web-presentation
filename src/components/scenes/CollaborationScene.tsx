"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
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
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-10 rounded-[48px] px-24 pt-14 pb-52">
      <div className="flex flex-col gap-4">
        <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">{track.title}</p>
        <h2 className="max-w-[85%] text-[62px] leading-[1.18] font-bold text-balance">
          {track.heroTitle}
        </h2>
        <p className="text-[30px] text-[var(--kiosk-muted)]">{track.heroSubtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {track.cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 55 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-[300px] flex-col gap-4 rounded-3xl border-2 border-white/10 bg-white/[0.04] p-9"
          >
            <h3 className="text-[36px] leading-tight font-bold">{card.title}</h3>
            <p className="text-[26px] font-medium text-[var(--kiosk-accent)]">{card.subtitle}</p>
            <p className="text-[24px] leading-relaxed text-[var(--kiosk-muted)]">{card.detail}</p>
          </motion.article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-8">
        <p className="text-[26px] text-[var(--kiosk-muted)]">{track.pricePolicy}</p>
        <button
          type="button"
          onClick={() => camera.goTo("connect")}
          className="min-h-[88px] cursor-pointer rounded-2xl bg-[var(--kiosk-accent)] px-10 text-[32px] font-semibold text-[#12160f]"
        >
          {track.cta}
        </button>
      </div>
    </div>
  )
}
