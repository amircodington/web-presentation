"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import type { SceneComponentProps } from "@/engine"

/**
 * The most important scene in the product and the only one most passers-by will
 * ever see. It has roughly three seconds to stop someone walking past, so it is
 * built to be unmistakably alive at ten metres: continuous motion, one line of
 * hero type, and an explicit touch cue — a surprising number of people do not
 * know a large screen is interactive.
 */
export function AttractScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"

  return (
    <button
      type="button"
      onClick={() => camera.next()}
      className="scene-surface relative flex h-full w-full flex-col items-center justify-center gap-14 overflow-hidden rounded-[48px] pb-52 text-center"
    >
      <AmbientField animate={state !== "far"} />

      <motion.p
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative text-[34px] font-medium tracking-[0.3em] text-[var(--kiosk-accent)]"
      >
        {content.brand.nameFa}
      </motion.p>

      <h1 className="relative max-w-[70%] text-[128px] leading-[1.1] font-black text-balance">
        پول را کسی به تو یاد نداد.
        <br />
        <span className="text-[var(--kiosk-accent)]">اینجا شروع می‌شود.</span>
      </h1>

      <p className="relative max-w-[55%] text-[40px] text-[var(--kiosk-muted)]">
        {content.brand.tagline}
      </p>

      <motion.div
        animate={isActive ? { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] } : {}}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-6 flex items-center gap-6 rounded-full border-2 border-[var(--kiosk-accent)]/40 bg-[var(--kiosk-accent)]/10 px-14 py-7"
      >
        <span className="text-[56px]">👆</span>
        <span className="text-[40px] font-semibold">برای شروع لمس کنید</span>
      </motion.div>
    </button>
  )
}

/**
 * Slow drifting orbs behind the type. Nothing loops in under 20 seconds and no
 * two loops share a period, so the field never resolves into a repeating pattern
 * that reads as a frozen screen from a distance.
 */
function AmbientField({ animate }: { animate: boolean }) {
  const orbs = [
    { size: 900, x: "12%", y: "8%", hue: "var(--kiosk-accent)", duration: 26 },
    { size: 700, x: "72%", y: "62%", hue: "#3D7BF2", duration: 34 },
    { size: 520, x: "48%", y: "18%", hue: "#F26D3D", duration: 41 },
  ]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {orbs.map((orb) => (
        <motion.div
          key={orb.hue + orb.duration}
          animate={animate ? { x: [0, 120, -80, 0], y: [0, -90, 60, 0] } : {}}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            insetInlineStart: orb.x,
            insetBlockStart: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.hue}33, transparent 65%)`,
            filter: "blur(40px)",
          }}
        />
      ))}
    </div>
  )
}
