"use client"

import { motion } from "motion/react"
import { kioskConfig } from "@/config/kiosk.config"
import { Icon } from "@/components/ui/Icon"
import { useCameraApi } from "@/engine"
import { useSound } from "./AudioProvider"
import type { IconName } from "@/content/schema/common"

/**
 * Persistent controls that sit above the canvas rather than on it, so they do not
 * move with the camera. Every scene has a visible way home — no dead ends.
 *
 * Back, home and mute — and nothing else. Brief §63 names a sitemap as something
 * this kiosk must not have: a visitor standing in a hall has one question, "how
 * do I get back", and every extra control on the tray is a second question.
 *
 * The controls are grouped into one tray rather than scattered as loose pills:
 * three separate buttons floating over a scene read as three separate decisions,
 * while one tray reads as "the navigation", which is what it is. It sits clear of
 * the stage's edge by keying off the margin the stage publishes, so the gap holds
 * on any screen rather than only on a 1920×1080 one.
 */
export function KioskChrome() {
  const camera = useCameraApi()
  const sound = useSound()

  const atAttract = camera.current.meta?.idleReturn === true
  const atHub = camera.current.meta?.hub === true

  return (
    <div data-kiosk-chrome>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute flex w-full justify-center"
        style={{ bottom: "calc(var(--kiosk-stage-margin, 0px) + 52px)" }}
      >
        <Tray>
          {!atAttract && camera.current.back ? (
            <ChromeButton onClick={() => camera.back()} icon="back">
              بازگشت
            </ChromeButton>
          ) : null}
          {!atAttract && !atHub ? (
            <ChromeButton onClick={() => camera.home()} icon="home">
              خانه
            </ChromeButton>
          ) : null}
          <ChromeButton
            onClick={sound.toggleMuted}
            icon={sound.muted ? "mute" : "sound"}
            label={sound.muted ? "روشن کردن صدا" : "قطع صدا"}
          >
            {sound.muted ? "صدا خاموش" : "صدا"}
          </ChromeButton>
          {!atAttract && camera.current.next ? (
            <ChromeButton onClick={() => camera.next()} icon="next">
              ادامه
            </ChromeButton>
          ) : null}
        </Tray>
      </motion.div>

      {/* Latin in an RTL document wraps per character without an explicit direction. */}
      <span
        dir="ltr"
        className="pointer-events-none absolute bottom-3 left-5 text-[15px] whitespace-nowrap text-[var(--kiosk-muted)] opacity-50"
      >
        v{kioskConfig.version}
      </span>
    </div>
  )
}

/** The single surface the controls sit on, so they read as one component. */
function Tray({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-card)] p-2"
      style={{ boxShadow: "6px 6px 0 0 var(--kiosk-border)" }}
    >
      {children}
    </div>
  )
}

function ChromeButton({
  children,
  onClick,
  icon,
  label,
  variant = "quiet",
}: {
  children: string
  onClick: () => void
  icon: IconName
  /** Overrides the accessible name when the visible label is a state, not an action. */
  label?: string
  variant?: "quiet" | "marked"
}) {
  // The chrome never takes the solid accent. Exactly one thing on screen should
  // read as "touch this", and that belongs to the scene, not the navigation.
  const marked = variant === "marked"

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      className="inline-flex min-h-[84px] cursor-pointer items-center gap-3.5 rounded-full px-8 text-[28px] font-semibold"
      style={{
        color: marked ? "var(--kiosk-accent)" : "var(--kiosk-card-text)",
        background: marked ? "var(--kiosk-accent-soft)" : "transparent",
      }}
    >
      <Icon name={icon} size={28} />
      {children}
    </motion.button>
  )
}
