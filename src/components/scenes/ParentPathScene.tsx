"use client"

import { motion } from "motion/react"
import { audienceById } from "@/content/select"
import { toPersianDigits } from "@/lib/format"
import { useSession } from "@/store/session"
import { Chip } from "@/components/ui/Chip"
import { Photo } from "@/components/ui/Photo"
import type { SceneComponentProps } from "@/engine"

/**
 * The one question that has to be asked before a parent can be recommended
 * anything: which year is the child in?
 *
 * A parent of a thirteen-year-old and a parent of a school-leaver are shopping for
 * different products, and nothing else on the screen can tell them apart. Answering
 * "just finished the entrance exam" re-files the visitor as that audience, which is
 * what promotes +18 ahead of the workshop for the rest of the session.
 */
export function ParentPathScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const parent = audienceById("parent")
  const setAudience = useSession((store) => store.setAudience)

  if (!parent?.followUp) return null

  return (
    <div className="scene-surface flex h-full w-full items-stretch gap-14 rounded-[48px] px-20 pt-16 pb-60">
      <div className="flex flex-1 flex-col justify-center gap-10">
        <div className="flex flex-col gap-4">
          <p className="text-[27px] font-medium text-[var(--kiosk-money)]">{parent.label}</p>
          <h2 className="display text-[72px]">{parent.question}</h2>
          <p className="text-[28px] text-[var(--kiosk-muted)]">
            مسیر پیشنهادی برای هر پایه فرق می‌کند.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {parent.followUp.options.map((option, index) => (
            <motion.button
              key={option.label}
              type="button"
              onClick={() => {
                setAudience(option.audience ?? "parent")
                camera.goTo("courses", "dive")
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
              className="mat flex min-h-[132px] cursor-pointer items-center gap-7 rounded-[28px] px-9 text-start"
            >
              <Chip label={toPersianDigits(index + 1)} tone="accent" size={72} />
              <span className="flex flex-col">
                <b className="text-[38px] leading-tight font-bold">{option.label}</b>
                <span className="text-[25px] text-[var(--kiosk-card-muted)]">{option.detail}</span>
              </span>
              <span className="ms-auto text-[32px] text-[var(--kiosk-accent)]">←</span>
            </motion.button>
          ))}
        </div>
      </div>

      {parent.media ? (
        <Photo media={parent.media} className="w-[38%] shrink-0 rounded-[36px]" />
      ) : null}
    </div>
  )
}
