"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { Button } from "@/components/ui/Button"
import type { SceneComponentProps } from "@/engine"

const PATHS = [
  { id: "audiences", icon: "🧭", title: "من کی هستم؟", body: "مسیر مناسب خودت را پیدا کن" },
  { id: "courses", icon: "📚", title: "دوره‌ها", body: "از نوجوان تا بزرگسال" },
  { id: "quiz-intro", icon: "⚡", title: "تست یک دقیقه‌ای", body: "ببین از کجا باید شروع کنی" },
  { id: "connect", icon: "🤝", title: "همکاری", body: "مدرسه، سازمان و نهاد" },
] as const

/** The hub every path returns to. Reachable from anywhere in at most two taps. */
export function HomeScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-16 rounded-[48px] px-24 py-20">
      <div className="flex flex-col gap-5">
        <p className="text-[30px] font-medium text-[var(--kiosk-accent)]">
          به {content.brand.nameFa} خوش آمدید
        </p>
        <h2 className="max-w-[80%] text-[84px] leading-[1.12] font-bold text-balance">
          از کجا می‌خواهی شروع کنی؟
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {PATHS.map((path, index) => (
          <motion.button
            key={path.id}
            type="button"
            onClick={() => camera.goTo(path.id)}
            initial={{ opacity: 0, y: 60 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
            className="flex min-h-[200px] items-center gap-8 rounded-3xl border-2 border-white/10 bg-white/[0.04] px-12 text-start"
          >
            <span className="text-[72px]">{path.icon}</span>
            <span className="flex flex-col gap-2">
              <span className="text-[44px] font-bold">{path.title}</span>
              <span className="text-[30px] text-[var(--kiosk-muted)]">{path.body}</span>
            </span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => camera.goTo("offer")}>
          {content.festival.offerTitle} ←
        </Button>
      </div>
    </div>
  )
}
