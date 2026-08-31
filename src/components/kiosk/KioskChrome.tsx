"use client"

import { AnimatePresence, motion } from "motion/react"
import { kioskConfig } from "@/config/kiosk.config"
import { Icon } from "@/components/ui/Icon"
import { useCameraApi } from "@/engine"
import type { IconName } from "@/content/schema/common"

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
    <div data-kiosk-chrome>
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
            <p className="rounded-full bg-[var(--kiosk-card)] px-8 py-3 text-[26px] text-[var(--kiosk-card-text)]">
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
            <ChromeButton onClick={() => camera.overview()} variant="accent" icon="map">
              نقشه کامل
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
    </div>
  )
}

function ChromeButton({
  children,
  onClick,
  variant = "ghost",
  icon,
}: {
  children: string
  onClick: () => void
  variant?: "ghost" | "accent"
  icon?: IconName
}) {
  // The chrome never takes the solid accent. Exactly one thing on screen should
  // read as "touch this", and that belongs to the scene, not the navigation.
  const skin =
    variant === "accent"
      ? "border-[var(--kiosk-accent)] text-[var(--kiosk-accent)]"
      : "border-[var(--kiosk-border)] text-[var(--kiosk-text)]"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[88px] cursor-pointer items-center gap-4 rounded-full border-2 bg-[color-mix(in_oklab,var(--kiosk-surface)_80%,black)] px-10 text-[29px] font-semibold shadow-[0_16px_40px_-18px_rgb(0_0_0/0.7)] ${skin}`}
    >
      {icon ? <Icon name={icon} size={30} /> : null}
      {children}
    </button>
  )
}
