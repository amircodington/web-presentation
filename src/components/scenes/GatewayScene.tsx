"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { useSession } from "@/store/session"
import { NextActivityBadge } from "@/components/kiosk/NextActivityBadge"
import { Icon } from "@/components/ui/Icon"
import { Logo } from "@/components/ui/Logo"
import { Mascot, type MascotName } from "@/components/ui/Mascot"
import type { World } from "@/content/schema/worlds"
import type { SceneComponentProps } from "@/engine"

/** The face each world puts on its own door. */
const GREETER: Record<World["id"], MascotName> = {
  kids: "piggy",
  teens: "rocket",
  adults: "ingot",
}

/**
 * The first interactive decision, and the only one on this screen.
 *
 * Everything the old hub carried — the catalogue, the journey map, the six
 * audience segments, the general-purpose test — is gone from here on purpose. A
 * visitor has to be able to answer "which of these three am I?" in under five
 * seconds while standing in a loud hall, and every additional element on this
 * screen is time spent not answering it.
 *
 * School and organisation are the strip underneath rather than a fourth card.
 * They are a real route and a valuable one, but a B2B visitor is not choosing a
 * world to play in, and giving them equal weight makes the three cards read as
 * five options rather than as three doors.
 */
export function GatewayScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { gateway, worlds } = content.worlds
  const setGroup = useSession((store) => store.setGroup)

  const enter = (world: World) => {
    setGroup(world.id)
    camera.goTo(`world-${world.id}`, "dive")
  }

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-5 rounded-[48px] px-20 pt-8 pb-[var(--kiosk-chrome-clearance,240px)]">
      <header className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Logo height={66} />
          <span className="felt rounded-full px-7 py-3 text-[23px] font-medium text-[var(--kiosk-card-muted)]">
            {content.event.contextTag}
          </span>
        </div>
        <NextActivityBadge />
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="display text-[68px]">{gateway.title}</h2>
        <p className="text-[27px] text-[var(--kiosk-muted)]">{gateway.subtitle}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-7">
        {worlds.map((world, index) => (
          <WorldCard
            key={world.id}
            world={world}
            index={index}
            isActive={isActive}
            onSelect={() => enter(world)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6">
        <span className="text-[27px] text-[var(--kiosk-muted)]">{gateway.secondary.question}</span>
        <button
          type="button"
          onClick={() => camera.goTo(gateway.secondary.scene, "glide")}
          className="mat flex min-h-[88px] cursor-pointer items-center gap-5 rounded-full px-9 text-[28px] font-semibold"
        >
          <Icon name="school" size={34} />
          {gateway.secondary.cta}
          <span className="text-[var(--kiosk-accent)]">←</span>
        </button>
      </div>
    </div>
  )
}

/**
 * One door.
 *
 * The card wears the world's own accent rather than the shared one, so the choice
 * is made against a preview of what is behind each door — the morph on entry then
 * confirms a promise the card already made instead of springing a new palette.
 */
function WorldCard({
  world,
  index,
  isActive,
  onSelect,
}: {
  world: World
  index: number
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 70 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
      style={{
        background: world.palette.background,
        color: world.palette.text,
        borderColor: world.palette.border,
        boxShadow: "9px 9px 0 0 var(--kiosk-border)",
      }}
      className="relative flex min-h-0 cursor-pointer flex-col items-center justify-between gap-3 overflow-hidden rounded-[40px] border-[4px] px-9 py-6 text-center"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background: `linear-gradient(to top, ${world.palette.accentSoft}, transparent)`,
        }}
      />

      {/*
        The greeter is the one part of the card that can give way. The card used to
        centre a fixed 132px character, a title, a subtitle and a call to action
        inside whatever height was left over, and clipped whichever of them did not
        fit — which was the character at the top and the call to action at the
        foot, the only thing on the card anybody has to press.
      */}
      <motion.span
        className="relative flex min-h-0 flex-1 items-center"
        animate={isActive ? { y: [0, -16, 0] } : { y: 0 }}
        transition={{
          duration: 2.6 + index * 0.4,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <Mascot
          name={GREETER[world.id]}
          mood="happy"
          className="h-full max-h-[132px] min-h-[68px] w-auto"
        />
      </motion.span>

      <span className="relative flex shrink-0 flex-col gap-1.5">
        <b className="display text-[42px] leading-tight">{world.display}</b>
        <span
          className="flex min-h-[2.6em] items-start justify-center text-[24px] leading-snug"
          style={{ color: world.palette.textMuted }}
        >
          {world.subtext}
        </span>
      </span>

      <span
        className="relative inline-flex min-h-[76px] shrink-0 items-center gap-3 rounded-full px-8 text-[26px] font-bold"
        style={{ background: world.palette.accent, color: world.palette.onAccent }}
      >
        بزن بریم
        <Icon name="play" size={24} />
      </span>
    </motion.button>
  )
}
