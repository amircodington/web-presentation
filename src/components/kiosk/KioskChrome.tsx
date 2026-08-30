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
            <p className="rounded-full bg-[var(--kiosk-text)] px-8 py-3 text-[26px] text-[var(--kiosk-bg)]">
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

      <span className="pointer-events-none absolute bottom-4 left-6 text-[16px] text-[var(--kiosk-muted)] opacity-50">
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
  // The chrome never takes the solid accent. Exactly one thing on screen should
  // read as "touch this", and that belongs to the scene, not the navigation.
  const skin =
    variant === "accent"
      ? "border-[var(--kiosk-accent)] bg-[var(--kiosk-surface)] text-[var(--kiosk-accent)]"
      : "border-[var(--kiosk-border)] bg-[var(--kiosk-surface)] text-[var(--kiosk-text)]"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[88px] cursor-pointer rounded-full border-2 px-10 text-[30px] font-semibold shadow-[0_12px_36px_-16px_rgb(23_19_16/0.45)] ${skin}`}
    >
      {children}
    </button>
  )
}
