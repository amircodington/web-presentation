"use client"

import { AnimatePresence, motion } from "motion/react"
import { kioskConfig } from "@/config/kiosk.config"
import type { CameraApi } from "@/engine"

/**
 * Persistent controls that sit above the canvas rather than on it, so they do not
 * move with the camera. Every scene has a visible way home — no dead ends.
 */
export function KioskChrome({ camera }: { camera: CameraApi | undefined }) {
  if (!camera) return null
  const atHome = camera.current.meta?.idleReturn === true

  return (
    <>
      <AnimatePresence>
        {!atHome ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute inset-inline-start-0 bottom-10 flex w-full justify-center gap-5"
          >
            {camera.current.back ? (
              <ChromeButton onClick={() => camera.back()}>→ بازگشت</ChromeButton>
            ) : null}
            <ChromeButton onClick={() => camera.home()}>خانه</ChromeButton>
            {camera.current.next ? (
              <ChromeButton onClick={() => camera.next()}>ادامه ←</ChromeButton>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="pointer-events-none absolute bottom-4 left-6 text-[16px] text-white/20">
        v{kioskConfig.version}
      </span>
    </>
  )
}

function ChromeButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[88px] rounded-full border-2 border-white/12 bg-black/50 px-10 text-[30px] font-semibold backdrop-blur-md"
    >
      {children}
    </button>
  )
}
