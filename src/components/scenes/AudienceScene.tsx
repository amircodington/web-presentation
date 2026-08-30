"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { useSession } from "@/store/session"
import type { SceneComponentProps } from "@/engine"

/**
 * The six audience segments. Rendered straight from `audiences.json`, so adding a
 * seventh is a content edit rather than a code change.
 */
export function AudienceScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const setAudience = useSession((store) => store.setAudience)

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-14 rounded-[48px] px-24 pt-16 pb-52">
      <div className="flex flex-col gap-4">
        <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">شناخت مخاطب</p>
        <h2 className="text-[76px] leading-[1.15] font-bold">کدام یک به تو نزدیک‌تر است؟</h2>
      </div>

      <div className="grid grid-cols-3 gap-7">
        {content.audiences.map((audience, index) => (
          <motion.button
            key={audience.id}
            type="button"
            onClick={() => {
              setAudience(audience.id)
              camera.goTo("courses")
            }}
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.7, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.96 }}
            className="flex min-h-[240px] flex-col justify-between rounded-3xl border-2 border-white/10 bg-white/[0.04] p-9 text-start"
          >
            <span className="text-[64px]">{audience.icon}</span>
            <span className="flex flex-col gap-2">
              <span className="text-[38px] font-bold">{audience.label}</span>
              <span className="text-[26px] leading-snug text-[var(--kiosk-muted)]">
                {audience.headline}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
