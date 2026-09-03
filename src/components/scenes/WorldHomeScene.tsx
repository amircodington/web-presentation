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
import { Photo } from "@/components/ui/Photo"
import type { AudienceGroup } from "@/content/schema/common"
import type { World, WorldExperience } from "@/content/schema/worlds"
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
  // The diagnostic is the last stop on the path, so it is counted as a column.
  const stops = Math.max(1, experiences.length + (diagnostic ? 1 : 0))

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-5 rounded-[48px] px-20 pt-12 pb-[var(--kiosk-chrome-clearance,240px)]">
      <header className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Logo height={72} />
          <span className="felt rounded-full px-7 py-3 text-[23px] font-medium text-[var(--kiosk-card-muted)]">
            {world.display}
          </span>
        </div>
        {/*
          The filing question rides in the header rather than on a row of its own.
          It is not a step on the path — it decides what the reveal leads with —
          and a full-width row for it competed with the four cards for the height
          they need. Brief §12: one screen, one main action.
        */}
        {world.qualifier ? (
          <div className="flex items-center gap-3">
            <span className="text-[23px] font-medium text-[var(--kiosk-muted)]">
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
                  aria-pressed={picked}
                  className="min-h-[88px] cursor-pointer rounded-full border-[4px] border-[var(--kiosk-border)] px-9 text-[25px] font-bold"
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
        <Progress done={done} total={experiences.length} />
      </header>

      {/*
        A world may set a photograph behind its headline. It is texture and never a
        claim about who the world is for — held well back from the type, and the
        board's own colour is still what the eye reads.
      */}
      <div className="relative flex flex-col gap-2">
        {world.surface.hero ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-20 -inset-y-6 overflow-hidden rounded-[36px]"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, black 38%, transparent), " +
                "linear-gradient(to left, transparent, black 22%, black 78%, transparent)",
              maskComposite: "intersect",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 38%, transparent), " +
                "linear-gradient(to left, transparent, black 22%, black 78%, transparent)",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Photo media={world.surface.hero} className="h-full w-full opacity-[0.17]" />
          </div>
        ) : null}
        <h2 className="display relative text-[76px]">{world.headline}</h2>
        <p className="relative text-[29px] text-[var(--kiosk-muted)]">{world.intro}</p>
      </div>

      {/*
       * The track count follows the number of stops, and a short path is capped
       * rather than stretched. One experience spread across 1600px reads as a
       * banner nobody presses; the same card at card width reads as a piece.
       */}
      <div
        className="mx-auto grid min-h-0 w-full flex-1 content-center items-stretch gap-6"
        style={{
          gridTemplateColumns: `repeat(${stops}, minmax(0, 1fr))`,
          maxWidth: stops === 1 ? "620px" : stops === 2 ? "1120px" : "100%",
        }}
      >
        {experiences.map((experience, index) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            step={index + 1}
            isDone={completed.includes(experience.id)}
            isActive={isActive}
            surface={world.surface}
            total={stops}
            onSelect={() => camera.goTo(experience.scene, "dive")}
          />
        ))}
        {diagnostic ? (
          <ExperienceCard
            experience={{
              id: "diagnostic",
              title: diagnostic.title,
              hook: diagnostic.hook,
              icon: diagnostic.icon,
              scene: diagnostic.scene,
              active: true,
            }}
            step={experiences.length + 1}
            isDone={false}
            isActive={isActive}
            surface={world.surface}
            total={stops}
            emphasis
            onSelect={() => camera.goTo(diagnostic.scene, "dive")}
          />
        ) : null}
      </div>

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

/**
 * One stop on the path, drawn in its world's own language.
 *
 * The three worlds used to render the same card fronted by the same smiling
 * character, so a thirty-year-old was greeted by a grinning piggy bank and the
 * teens' world was the kids' world in navy. What changes here is not the colour:
 * it is what fronts the card, what the step is called, and what the card is made
 * of. See `WorldSurfaceSchema` for the three languages.
 */
function ExperienceCard({
  experience,
  step,
  total,
  isDone,
  isActive,
  surface,
  emphasis = false,
  onSelect,
}: {
  experience: WorldExperience
  step: number
  /** How many stops there are, for a world that indexes them. */
  total: number
  isDone: boolean
  isActive: boolean
  surface: World["surface"]
  /** Marks the diagnostic, which is the one stop that is not a game. */
  emphasis?: boolean
  onSelect: () => void
}) {
  const level = surface.style === "level"
  const ledger = surface.style === "ledger"

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 60 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
      transition={{ duration: 0.5, delay: step * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileTap={
        level ? { scale: 0.97 } : { x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }
      }
      /*
        A toy card fills its row — the character is the content and it wants the
        height. A level tile and a ledger tile are read top-down and are done when
        the copy is done; stretching them to the row left half a card of nothing
        under every hook. They size to their content and sit at the top of the row.
      */
      className={
        level
          ? "relative flex cursor-pointer flex-col items-stretch gap-4 self-start overflow-hidden rounded-[28px] border-[3px] px-7 py-6 text-start"
          : ledger
            ? "mat relative flex cursor-pointer flex-col items-stretch gap-4 self-start overflow-hidden rounded-[36px] px-8 py-7 text-start"
            : "mat relative flex min-h-0 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-[36px] px-8 py-7 text-center"
      }
      style={
        level
          ? {
              background: emphasis ? "var(--kiosk-accent-soft)" : "var(--kiosk-surface)",
              borderColor: emphasis ? "var(--kiosk-accent)" : "color-mix(in oklab, var(--kiosk-text) 22%, transparent)",
              color: emphasis ? "var(--kiosk-card-text)" : "var(--kiosk-text)",
            }
          : emphasis
            ? { background: "var(--kiosk-accent-soft)", borderColor: "var(--kiosk-accent)" }
            : undefined
      }
    >
      <Step
        surface={surface}
        step={step}
        total={total}
        isDone={isDone}
        icon={experience.icon}
      />

      <Art surface={surface} experience={experience} step={step} isDone={isDone} isActive={isActive} />

      <b
        className={
          "flex items-center text-[34px] leading-tight font-bold text-balance " +
          (ledger || level ? "min-h-[2.3em]" : "min-h-[2.3em] justify-center")
        }
      >
        {experience.title}
      </b>
      <span
        className={
          "flex min-h-[2.9em] items-start text-[23px] leading-snug " +
          (level ? "text-[var(--kiosk-muted)]" : "text-[var(--kiosk-card-muted)]")
        }
      >
        {experience.hook}
      </span>

    </motion.button>
  )
}

/**
 * How a world indexes its stops.
 *
 * The kids' world numbers them in a corner and says nothing else — a seven-year-old
 * is not tracking progress, they are choosing the one with the pig on it. The teens'
 * world names them, because a named level is the thing you want the next one of. The
 * adults' world rules an index across the top, the way a document is paginated.
 */
function Step({
  surface,
  step,
  total,
  isDone,
  icon,
}: {
  surface: World["surface"]
  step: number
  total: number
  isDone: boolean
  icon: WorldExperience["icon"]
}) {
  const done = isDone ? (
    <span className="text-[var(--kiosk-positive)]">
      <Icon name="check" size={32} />
    </span>
  ) : null

  if (surface.style === "level") {
    return (
      <span className="flex items-center justify-between gap-3">
        <span className="text-[22px] font-black tracking-[0.14em] text-[var(--kiosk-accent)] tabular-nums">
          {surface.stepLabel ? `${surface.stepLabel} ` : ""}
          {toPersianDigits(step)}
        </span>
        {done}
      </span>
    )
  }

  if (surface.style === "ledger") {
    return (
      <span className="flex flex-col gap-3">
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3 text-[var(--kiosk-accent)]">
            <Icon name={icon} size={30} />
          </span>
          <span className="text-[21px] font-semibold text-[var(--kiosk-card-muted)] tabular-nums">
            {toPersianDigits(step)} / {toPersianDigits(total)}
          </span>
        </span>
        <span
          aria-hidden
          className="h-px w-full"
          style={{ background: "color-mix(in oklab, var(--kiosk-card-text) 20%, transparent)" }}
        />
      </span>
    )
  }

  return (
    <>
      <span className="absolute start-6 top-5 text-[26px] font-black text-[var(--kiosk-card-muted)]">
        {toPersianDigits(step)}
      </span>
      {isDone ? <span className="absolute end-5 top-5">{done}</span> : null}
    </>
  )
}

/**
 * What fronts a card.
 *
 * A character in the kids' world, because the character *is* the game there. A
 * geometric mark in the teens' world. Nothing at all in the adults' world: brief
 * §4.1 asks for data and scenario, and a cartoon is the single loudest way to tell
 * an adult a screen was not built for them.
 */
function Art({
  surface,
  experience,
  step,
  isDone,
  isActive,
}: {
  surface: World["surface"]
  experience: WorldExperience
  step: number
  isDone: boolean
  isActive: boolean
}) {
  if (surface.style === "ledger") return null

  if (surface.style === "level") {
    return (
      <span className="flex items-center justify-start pt-1 text-[var(--kiosk-accent)]">
        <Icon name={experience.icon} size={64} />
      </span>
    )
  }

  return (
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
        className="h-full max-h-[130px] min-h-[58px] w-auto"
      />
    </motion.span>
  )
}
