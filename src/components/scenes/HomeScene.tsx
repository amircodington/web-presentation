"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { prioritisedAudiences } from "@/content/select"
import { useSession } from "@/store/session"
import { NextActivityBadge } from "@/components/kiosk/NextActivityBadge"
import { Chip } from "@/components/ui/Chip"
import { Icon } from "@/components/ui/Icon"
import { Logo } from "@/components/ui/Logo"
import { Photo } from "@/components/ui/Photo"
import type { Audience } from "@/content/schema/catalogue"
import type { SceneComponentProps } from "@/engine"

/**
 * The hub every path returns to.
 *
 * It asks the visitor to point at themselves — "I'm a student", not "Students" —
 * because a first-person card is answered without translation. The order and the
 * split between the photographed cards and the quiet strip beneath them come from
 * `event.json`: at a teen-and-family event the teenager is met first and the
 * school and the organisation wait their turn, and at a trade day that inverts
 * without a code change.
 *
 * The self-test sits beside the audience cards at equal weight rather than in the
 * queue behind them, because it is the one route that works for a visitor who
 * does not want to declare anything about themselves.
 */
export function HomeScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const { primary, secondary } = prioritisedAudiences()
  const setAudience = useSession((store) => store.setAudience)

  const choose = (audience: Audience) => {
    setAudience(audience.id)
    camera.goTo(audience.followUp ? "parent-path" : "courses", "dive")
  }

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-7 rounded-[48px] px-20 pt-12 pb-52">
      <header className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Logo height={82} />
          <span className="felt rounded-full px-7 py-3 text-[23px] font-medium text-[var(--kiosk-muted)]">
            {content.event.contextTag}
          </span>
        </div>
        <NextActivityBadge />
      </header>

      <h2 className="display text-[80px]">کدوم مسیر برای توئه؟</h2>

      <div className="grid flex-1 grid-cols-4 gap-6">
        {primary.map((audience, index) => (
          <AudienceCard
            key={audience.id}
            audience={audience}
            index={index}
            isActive={isActive}
            onSelect={() => choose(audience)}
          />
        ))}
        <SelfTestCard
          index={primary.length}
          isActive={isActive}
          onSelect={() => camera.goTo("quiz-intro", "dive")}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {secondary.map((audience) => (
          <button
            key={audience.id}
            type="button"
            onClick={() => choose(audience)}
            className="mat flex min-h-[96px] cursor-pointer items-center gap-5 rounded-2xl px-7 text-start"
          >
            <span className="text-[var(--kiosk-accent)]">
              <Icon name={audience.icon} size={38} />
            </span>
            <span className="text-[29px] font-semibold">{audience.selfLabel}</span>
            <span className="ms-auto text-[26px] text-[var(--kiosk-accent)]">←</span>
          </button>
        ))}

        {content.festival.offerActive ? (
          <button
            type="button"
            onClick={() => camera.goTo("offer", "rise")}
            className="mat flex min-h-[96px] cursor-pointer items-center gap-5 rounded-2xl px-7 text-start text-[var(--kiosk-accent)] ring-3 ring-[var(--kiosk-accent)] ring-inset"
          >
            <Icon name="gift" size={38} />
            <span className="text-[29px] font-semibold">{content.festival.offerTitle}</span>
            <span className="ms-auto text-[26px]">←</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * One audience, fronted by a photograph of that audience actually at a session.
 *
 * The chip straddling the photo's lower edge is the card's anchor: it carries the
 * icon, it ties the card to the counters on the table at the stand, and it gives
 * the eye somewhere to land before it reads the label.
 */
function AudienceCard({
  audience,
  index,
  isActive,
  onSelect,
}: {
  audience: Audience
  index: number
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 60 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className="mat relative flex cursor-pointer flex-col overflow-hidden rounded-[32px] text-start"
    >
      {audience.media ? (
        <Photo media={audience.media} className="h-[58%] w-full" />
      ) : (
        <span className="h-[58%] w-full bg-[var(--kiosk-surface)]" />
      )}

      <span className="absolute inset-x-0 top-[58%] flex -translate-y-1/2 justify-center">
        <Chip icon={audience.icon} tone="accent" size={86} />
      </span>

      <span className="flex flex-1 flex-col justify-center gap-2 px-7 pt-12 pb-6">
        <b className="text-[36px] leading-tight font-bold">{audience.selfLabel}</b>
        <span className="text-[24px] leading-snug text-[var(--kiosk-card-muted)]">
          {audience.headline}
        </span>
      </span>
    </motion.button>
  )
}

/** The route for a visitor who would rather be told than declare. */
function SelfTestCard({
  index,
  isActive,
  onSelect,
}: {
  index: number
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 60 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className="relative flex cursor-pointer flex-col items-center justify-center gap-6 overflow-hidden rounded-[32px] bg-[var(--kiosk-accent)] px-8 text-center text-[var(--kiosk-on-accent)] shadow-[0_14px_0_-3px_color-mix(in_oklab,var(--kiosk-accent)_52%,black)]"
    >
      <Chip icon="gauge" tone="paper" size={100} />
      <b className="display text-[44px] leading-tight">هوش مالی‌ام رو محک می‌زنم</b>
      <span className="inline-flex items-center gap-3 rounded-full bg-[var(--kiosk-on-accent)] px-8 py-3 text-[28px] font-bold text-[var(--kiosk-accent)]">
        {content.event.attract.cta}
        <Icon name="play" size={22} />
      </span>
    </motion.button>
  )
}
