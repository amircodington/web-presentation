"use client"

import { AnimatePresence, motion } from "motion/react"
import { kioskConfig } from "@/config/kiosk.config"
import { useCameraApi } from "@/engine"

/**
 * Persistent controls that sit above the canvas rather than on it, so they do not
 * move with the camera. Every scene has a visible way home — no dead ends.
 */
export function KioskChrome() {
  const camera = useCameraApi()

  const atAttract = camera.current.meta?.idleReturn === true
  const atHub = camera.current.meta?.hub === true
  const inOverview = camera.isOverview

  return (
    <>
      <AnimatePresence mode="popLayout">
        {inOverview ? (
          <motion.div
            key="overview-bar"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute bottom-10 flex w-full flex-col items-center gap-5"
          >
            <p className="rounded-full bg-black/60 px-8 py-3 text-[26px] text-white/70 backdrop-blur-md">
              روی هر بخش بزنید تا به آن بروید
            </p>
            <ChromeButton onClick={() => camera.exitOverview()}>بستن نقشه</ChromeButton>
          </motion.div>
        ) : (
          <motion.div
            key="nav-bar"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute bottom-10 flex w-full justify-center gap-5"
          >
            {!atAttract && camera.current.back ? (
              <ChromeButton onClick={() => camera.back()}>→ بازگشت</ChromeButton>
            ) : null}
            {!atAttract && !atHub ? (
              <ChromeButton onClick={() => camera.home()}>خانه</ChromeButton>
            ) : null}
            <ChromeButton onClick={() => camera.overview()} variant="accent">
              🗺 نقشه کامل
            </ChromeButton>
            {!atAttract && camera.current.next ? (
              <ChromeButton onClick={() => camera.next()}>ادامه ←</ChromeButton>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <span className="pointer-events-none absolute bottom-4 left-6 text-[16px] text-white/20">
        v{kioskConfig.version}
      </span>
    </>
  )
}

function ChromeButton({
  children,
  onClick,
  variant = "ghost",
}: {
  children: string
  onClick: () => void
  variant?: "ghost" | "accent"
}) {
  const skin =
    variant === "accent"
      ? "border-[var(--kiosk-accent)]/50 bg-[var(--kiosk-accent)]/15 text-[var(--kiosk-accent)]"
      : "border-white/12 bg-black/50 text-[var(--kiosk-text)]"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[88px] cursor-pointer rounded-full border-2 px-10 text-[30px] font-semibold backdrop-blur-md ${skin}`}
    >
      {children}
    </button>
  )
}
