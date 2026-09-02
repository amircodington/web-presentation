"use client"

import { AnimatePresence, motion } from "motion/react"
import { useSound } from "./AudioProvider"

/**
 * Captions whatever the kiosk just said.
 *
 * Brief §55 is the whole reason this exists: no instruction may be carried by
 * audio alone. A hall is loud, a hearing-impaired visitor gets nothing from a
 * voice line, and the mute button is right there — so every spoken line is also
 * written, and a cue the team has written but not yet recorded still reaches the
 * visitor through this bar.
 *
 * It sits above the chrome tray rather than beside it: a caption that shares a
 * row with the navigation reads as another button.
 */
export function Subtitles() {
  const { subtitle } = useSound()

  return (
    <AnimatePresence>
      {subtitle ? (
        <motion.div
          key={subtitle}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute flex w-full justify-center"
          style={{ bottom: "calc(var(--kiosk-stage-margin, 0px) + 178px)" }}
        >
          <p
            role="status"
            className="mat rounded-full px-10 py-3 text-[30px] font-bold"
          >
            {subtitle}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
