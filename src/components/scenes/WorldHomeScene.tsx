"use client"

import { motion } from "motion/react"
import { useEffect } from "react"
import { activeExperiences, worldById } from "@/content/select"
import { castFor } from "@/lib/games/cast"
import { toPersianDigits } from "@/lib/format"
import { useSession } from "@/store/session"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Icon } from "@/components/ui/Icon"
import { Logo } from "@/components/ui/Logo"
import { Mascot } from "@/components/ui/Mascot"
import type { AudienceGroup } from "@/content/schema/common"
import type { WorldExperience } from "@/content/schema/worlds"
import type { SceneComponentProps } from "@/engine"

/**
 * A world's own front door, once the visitor is inside it.
 *
 * The four experiences are laid out as a path rather than a menu, because at a
 * festival nobody completes four of anything. Brief §12 is explicit: one
 * experience plus one diagnostic is the whole minimum, and every extra one only
 * sharpens the result. So the path shows what is done, what is next, and never
 * insists — the diagnostic sits at the end of it and is reachable from the start.
 */
export function WorldHomeScene({ state, camera, props }: SceneComponentProps) {
  const isActive = state === "active"
  const groupId = String(props.world ?? "") as AudienceGroup
  const world = worldById(groupId)
  const completed = useSession((store) => store.completed)
  const { play } = useSound()
  const audience = useSession((store) => store.audience)
  const setAudience = useSession((store) => store.setAudience)

  // Greeted on arrival, not on every render: a world re-entered after a game
  // says hello again, but a state change inside it does not.
  const greeting = world?.greetingCue
  useEffect(() => {
    if (isActive && greeting) play(greeting)
  }, [greeting, isActive, play])

  if (!world) return null

  const experiences = activeExperiences(groupId)
  const diagnostic = world.diagnostic?.active ? world.diagnostic : undefined
  const done = experiences.filter((experience) => completed.includes(experience.id)).length

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-5 rounded-[48px] px-20 pt-12 pb-60">
      <header className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Logo height={72} />
          <span className="felt rounded-full px-7 py-3 text-[23px] font-medium text-[var(--kiosk-card-muted)]">
            {world.display}
          </span>
        </div>
        <Progress done={done} total={experiences.length} />
      </header>

      <div className="flex flex-col gap-2">
        <h2 className="display text-[76px]">{world.headline}</h2>
        <p className="text-[29px] text-[var(--kiosk-muted)]">{world.intro}</p>
      </div>

      {/*
       * The track count follows the number of stops, and a short path is capped
       * rather than stretched. One experience spread across 1600px reads as a
       * banner nobody presses; the same card at card width reads as a piece.
       */}
      <div
        className="mx-auto grid min-h-0 w-full flex-1 items-stretch gap-6"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, experiences.length)}, minmax(0, 1fr))`,
          maxWidth: experiences.length === 1 ? "620px" : experiences.length === 2 ? "1120px" : "100%",
        }}
      >
        {experiences.map((experience, index) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            step={index + 1}
            isDone={completed.includes(experience.id)}
            isActive={isActive}
            onSelect={() => camera.goTo(experience.scene, "dive")}
          />
        ))}
      </div>

      {/*
       * One question that re-files the visitor into a narrower catalogue
       * audience — brief §44. It sits on the world home rather than in a game
       * because it decides what the *reveal* leads with, and a visitor who plays
       * one experience and leaves should still have answered it.
       */}
      {world.qualifier ? (
        <div className="flex items-center justify-center gap-4">
          <span className="text-[25px] font-medium text-[var(--kiosk-muted)]">
            {world.qualifier.prompt}
          </span>
          {world.qualifier.options.map((option) => {
            const picked = audience === option.audience
            return (
              <button
                key={option.audience}
                type="button"
                onClick={() => setAudience(option.audience)}
                aria-label={`${world.qualifier!.prompt} ${option.label}`}
                className="min-h-[88px] cursor-pointer rounded-full border-[4px] border-[var(--kiosk-border)] px-10 text-[26px] font-bold"
                style={{
                  background: picked ? "var(--kiosk-accent)" : "var(--kiosk-card)",
                  color: picked ? "var(--kiosk-on-accent)" : "var(--kiosk-card-text)",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {/*
       * Products appear only once something has been played. Brief §46 puts the
       * reveal after a result, and the ordering is the product argument in one
       * rule: experience, then result, then offer — never a catalogue first.
       */}
      {world.reveal && done > 0 ? (
        <motion.button
          type="button"
          onClick={() => camera.goTo(world.reveal!.scene, "rise")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-[96px] shrink-0 cursor-pointer items-center gap-6 rounded-[32px] border-[4px] border-[var(--kiosk-border)] bg-[var(--kiosk-accent)] px-10 text-start text-[var(--kiosk-on-accent)]"
          style={{ boxShadow: "8px 8px 0 0 var(--kiosk-border)" }}
        >
          <Icon name="gift" size={42} />
          <b className="text-[34px] font-bold">{world.reveal.title}</b>
          <span className="ms-auto text-[28px] font-bold">{world.reveal.cta} ←</span>
        </motion.button>
      ) : null}

      {diagnostic ? (
        <button
          type="button"
          onClick={() => camera.goTo(diagnostic.scene, "dive")}
          className="mat flex min-h-[100px] shrink-0 cursor-pointer items-center gap-7 rounded-[32px] px-10 text-start"
        >
          <Icon name={diagnostic.icon} size={44} />
          <span className="flex flex-col">
            <b className="text-[36px] leading-tight font-bold">{diagnostic.title}</b>
            <span className="text-[24px] text-[var(--kiosk-card-muted)]">{diagnostic.hook}</span>
          </span>
          <span className="ms-auto text-[30px] font-bold text-[var(--kiosk-accent)]">شروع ←</span>
        </button>
      ) : null}
    </div>
  )
}

/** How far along the path the visitor is. Never a requirement, only a count. */
function Progress({ done, total }: { done: number; total: number }) {
  return (
    <span className="pill flex items-center gap-3 rounded-full px-7 py-3 text-[24px] font-semibold">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="grid h-6 w-6 place-items-center rounded-full"
          style={{
            background: index < done ? "var(--kiosk-positive)" : "transparent",
            boxShadow: "inset 0 0 0 3px var(--kiosk-border)",
          }}
        />
      ))}
      {toPersianDigits(done)} از {toPersianDigits(total)}
    </span>
  )
}

/** One stop on the path, fronted by the character that hosts it. */
function ExperienceCard({
  experience,
  step,
  isDone,
  isActive,
  onSelect,
}: {
  experience: WorldExperience
  step: number
  isDone: boolean
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 60 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
      transition={{ duration: 0.5, delay: step * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
      className="mat relative flex min-h-0 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-[36px] px-8 py-7 text-center"
    >
      <span className="absolute start-6 top-5 text-[26px] font-black text-[var(--kiosk-card-muted)]">
        {toPersianDigits(step)}
      </span>
      {isDone ? (
        <span className="absolute end-5 top-5 text-[var(--kiosk-positive)]">
          <Icon name="check" size={40} />
        </span>
      ) : null}

      {/*
        The art is the one part of a card that can give up space, so it is sized by
        the row rather than by a constant. A world carrying more rows below the grid
        — adults carries three — leaves the grid shorter, and a fixed-height
        character pushed the hook straight out through the bottom of the card.
      */}
      <motion.span
        animate={isActive ? { y: [0, -12, 0] } : { y: 0 }}
        transition={{
          duration: 2.2 + step * 0.3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="flex min-h-0 flex-1 items-center justify-center"
      >
        <Mascot
          name={castFor(experience.icon)}
          mood={isDone ? "wow" : "happy"}
          className="h-full max-h-[130px] w-auto"
        />
      </motion.span>

      {/*
        Titles run to one line or two, and a title box that grows takes its height
        out of the art above it — which left one card in a row with a character half
        the size of its neighbours'. Reserving two lines everywhere keeps the row's
        art on one baseline whatever the copy does.
      */}
      <b className="flex min-h-[2.3em] items-center text-[34px] leading-tight font-bold text-balance">
        {experience.title}
      </b>
      <span className="flex min-h-[2.9em] items-start text-[23px] leading-snug text-[var(--kiosk-card-muted)]">
        {experience.hook}
      </span>
    </motion.button>
  )
}
