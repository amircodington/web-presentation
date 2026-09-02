"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect } from "react"
import { useSound } from "./AudioProvider"
import { Icon } from "@/components/ui/Icon"
import { Mascot } from "@/components/ui/Mascot"

interface Props {
  /** The badge to award, or `undefined` while nothing is being celebrated. */
  badge?: { title: string; label: string; note: string }
  onDone: () => void
}

/** Brief §22 caps the whole thing at four seconds, sound included. */
const HOLD_MS = 4_000
const CONFETTI = 34
const COINS = 14

/**
 * The full-screen moment a child gets for finishing anything.
 *
 * Brief §22 makes it mandatory, and the reason is that everything before it was
 * learning — the celebration is the part a seven-year-old tells their parent
 * about on the way home, and it is what makes them pull someone else over to the
 * screen. It is deliberately not a score: a child who spent all their coins on
 * ice cream gets exactly the same confetti.
 *
 * It dismisses itself. Nobody at a booth should have to close a party.
 */
export function Celebration({ badge, onDone }: Props) {
  const { play } = useSound()
  const showing = badge !== undefined

  useEffect(() => {
    if (!showing) return
    play("celebrate")
    // The headline below is the same sentence, four times the size. The caption
    // would only sit on top of the badge saying it again.
    play("voice-smarter", { caption: false })
    const timer = setTimeout(onDone, HOLD_MS)
    return () => clearTimeout(timer)
  }, [onDone, play, showing])

  return (
    <AnimatePresence>
      {badge ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden rounded-[48px] pb-40"
          style={{ background: "color-mix(in oklab, var(--kiosk-bg) 92%, var(--kiosk-money))" }}
        >
          <Confetti />
          <CoinRain />

          <motion.div
            initial={{ scale: 0.3, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="relative flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ y: [0, -22, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mascot name="piggy" mood="wow" size={230} />
            </motion.div>

            <h2 className="display max-w-[80%] text-center text-[76px] text-balance">
              {badge.title}
            </h2>

            <span
              className="flex items-center gap-5 rounded-full border-[5px] border-[var(--kiosk-border)] bg-[var(--kiosk-money)] px-12 py-4 text-[44px] font-black text-[var(--kiosk-border)]"
              style={{ boxShadow: "10px 10px 0 0 var(--kiosk-border)" }}
            >
              <Icon name="spark" size={44} />
              {badge.label}
            </span>

            <p className="text-[30px] font-medium text-[var(--kiosk-muted)]">{badge.note}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Paper, falling.
 *
 * Every piece gets its own drift, spin and delay from its index rather than from
 * a random number, so the burst is identical every time it plays — which is what
 * lets it be tuned once and trusted, and keeps it stable under a reduced-motion
 * pass instead of jittering differently on each render.
 */
function Confetti() {
  const tones = ["var(--kiosk-accent)", "var(--kiosk-money)", "var(--kiosk-positive)", "var(--kiosk-joy)"]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: CONFETTI }, (_, index) => (
        <motion.span
          key={index}
          className="absolute block rounded-[3px]"
          style={{
            left: `${(index * 97) % 100}%`,
            width: 18,
            height: 26,
            background: tones[index % tones.length],
          }}
          initial={{ y: -80, rotate: 0, opacity: 1 }}
          animate={{ y: 1200, rotate: 540 + (index % 5) * 90, x: ((index % 7) - 3) * 40 }}
          transition={{
            duration: 2.6 + (index % 5) * 0.4,
            delay: (index % 11) * 0.12,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

/** Money, falling — the same coin the whole product is built around. */
function CoinRain() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: COINS }, (_, index) => (
        <motion.span
          key={index}
          className="absolute block"
          style={{ left: `${(index * 173) % 96}%` }}
          initial={{ y: -120, opacity: 1 }}
          animate={{ y: 1220, rotate: 360 }}
          transition={{
            duration: 2.4 + (index % 4) * 0.5,
            delay: (index % 7) * 0.18,
            ease: "linear",
          }}
        >
          <Mascot name="coin" mood="happy" size={54} />
        </motion.span>
      ))}
    </div>
  )
}

