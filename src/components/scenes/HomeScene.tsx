"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import type { SceneComponentProps } from "@/engine"

const PATHS = [
  { id: "audiences", icon: "🧭", title: "من کی هستم؟", body: "مسیر مناسب خودت را پیدا کن" },
  { id: "courses", icon: "📚", title: "دوره‌ها", body: "از نوجوان تا بزرگسال" },
  { id: "quiz-intro", icon: "⚡", title: "تست یک دقیقه‌ای", body: "ببین از کجا باید شروع کنی" },
  { id: "live", icon: "🎤", title: "فعالیت‌های زنده", body: "همین حالا در غرفه" },
  { id: "collab-schools", icon: "🏫", title: "همکاری", body: "مدرسه، سازمان و نهاد" },
] as const

/** The hub every path returns to. Reachable from anywhere in at most two taps. */
export function HomeScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-12 rounded-[48px] px-24 pt-16 pb-52">
      <div className="flex flex-col gap-4">
        <p className="text-[30px] font-medium text-[var(--kiosk-accent)]">
          به {content.brand.nameFa} خوش آمدید
        </p>
        <h2 className="max-w-[80%] text-[76px] leading-[1.12] font-bold text-balance">
          از کجا می‌خواهی شروع کنی؟
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {PATHS.map((path, index) => (
          <motion.button
            key={path.id}
            type="button"
            onClick={() => camera.goTo(path.id)}
            initial={{ opacity: 0, y: 60 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
            className="flex min-h-[210px] cursor-pointer flex-col justify-between rounded-3xl border-2 border-white/10 bg-white/[0.04] p-9 text-start"
          >
            <span className="text-[60px]">{path.icon}</span>
            <span className="flex flex-col gap-1">
              <span className="text-[38px] font-bold">{path.title}</span>
              <span className="text-[26px] text-[var(--kiosk-muted)]">{path.body}</span>
            </span>
          </motion.button>
        ))}

        {content.festival.offerActive ? (
          <motion.button
            type="button"
            onClick={() => camera.goTo("offer")}
            initial={{ opacity: 0, y: 60 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.55, delay: PATHS.length * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
            className="flex min-h-[210px] cursor-pointer flex-col justify-between rounded-3xl border-2 border-[var(--kiosk-accent)] bg-[var(--kiosk-accent)]/12 p-9 text-start"
          >
            <span className="text-[60px]">🎁</span>
            <span className="flex flex-col gap-1">
              <span className="text-[38px] font-bold text-[var(--kiosk-accent)]">
                {content.festival.offerTitle}
              </span>
              <span className="text-[26px] text-[var(--kiosk-muted)]">{content.festival.name}</span>
            </span>
          </motion.button>
        ) : null}
      </div>
    </div>
  )
}
