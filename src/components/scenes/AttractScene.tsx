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

      <h1 className="relative max-w-[74%] text-[128px] leading-[1.08] font-black text-balance">
        پول را کسی به تو یاد نداد.
        <br />
        <span className="relative inline-block px-6 text-[var(--kiosk-on-accent)]">
          <span
            aria-hidden
            className="absolute inset-0 -skew-x-3 rounded-lg bg-[var(--kiosk-accent)]"
          />
          <span className="relative">اینجا شروع می‌شود.</span>
        </span>
      </h1>

      <p className="relative max-w-[55%] text-[40px] text-[var(--kiosk-muted)]">
        {content.brand.tagline}
      </p>

      <motion.div
        animate={isActive ? { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] } : {}}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-6 flex items-center gap-6 rounded-full bg-[var(--kiosk-accent)] px-14 py-7 text-[var(--kiosk-on-accent)] shadow-[0_24px_70px_-24px_var(--kiosk-accent)]"
      >
        <span className="text-[56px]">👆</span>
        <span className="text-[40px] font-semibold">برای شروع لمس کنید</span>
      </motion.div>
    </button>
  )
}

/**
 * Slow drifting shapes behind the type.
 *
 * Heavily blurred tinted discs, so the ground reads as a soft wash rather than as
 * hard shapes. Nothing loops in under 20 seconds and no two loops share a period,
 * so the field never resolves into a repeating pattern that reads as a frozen
 * screen from a distance.
 */
function AmbientField({ animate }: { animate: boolean }) {
  const orbs = [
    { id: "a", size: 860, x: "6%", y: "4%", tint: "var(--kiosk-accent)", opacity: 0.16, duration: 26 },
    { id: "b", size: 700, x: "68%", y: "56%", tint: "#E8A33C", opacity: 0.16, duration: 34 },
    { id: "c", size: 520, x: "44%", y: "12%", tint: "var(--kiosk-accent)", opacity: 0.1, duration: 41 },
  ]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          animate={animate ? { x: [0, 120, -80, 0], y: [0, -90, 60, 0] } : {}}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            insetInlineStart: orb.x,
            insetBlockStart: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "9999px",
            background: orb.tint,
            opacity: orb.opacity,
            filter: "blur(90px)",
          }}
        />
      ))}
    </div>
  )
}
