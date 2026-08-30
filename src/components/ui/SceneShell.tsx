"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"
import type { SceneState } from "@/engine"

interface SceneShellProps {
  state: SceneState
  eyebrow?: string
  title?: ReactNode
  children?: ReactNode
  className?: string
}

/**
 * Common frame for every scene: the surface, the entrance stagger, and the
 * lifecycle contract.
 *
 * Entrance choreography lives here rather than in the camera, because a scene
 * never needs to know where it sits on the canvas and the camera never needs to
 * know what is inside a scene.
 */
export function SceneShell({ state, eyebrow, title, children, className = "" }: SceneShellProps) {
  const isActive = state === "active"

  return (
    <div
      className={`scene-surface flex h-full w-full flex-col justify-center gap-10 rounded-[48px] px-24 py-20  ${className}`}
      style={{ opacity: state === "far" ? 0.45 : 1 }}
    >
      {eyebrow ? (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-[28px] font-medium tracking-wide text-[var(--kiosk-accent)]"
        >
          {eyebrow}
        </motion.p>
      ) : null}

      {title ? (
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[85%] text-[72px] leading-[1.15] font-bold text-balance"
        >
          {title}
        </motion.h2>
      ) : null}

      {children}
    </div>
  )
}
