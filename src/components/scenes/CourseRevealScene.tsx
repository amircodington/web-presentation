"use client"

import { motion } from "motion/react"
import { content } from "@/content/load"
import { coursesForWorld, priceFor, worldById } from "@/content/select"
import { useSession } from "@/store/session"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Photo } from "@/components/ui/Photo"
import type { AudienceGroup } from "@/content/schema/common"
import type { SceneComponentProps } from "@/engine"

/**
 * A world's products, shown after its result and never before its experiences.
 *
 * Brief §46 sets that order and §23 is the reason it needed a scene of its own:
 * the kids' classes were missing from the previous build entirely, because the
 * only place a product could appear was a catalogue aimed at teenagers. A world
 * now names where its own products are revealed, and the copy above them is the
 * world's, not the catalogue's.
 */
export function CourseRevealScene({ state, camera, props }: SceneComponentProps) {
  const isActive = state === "active"
  const groupId = String(props.world ?? "") as AudienceGroup
  const world = worldById(groupId)
  const reveal = world?.reveal
  const answered = useSession((store) => store.audience)

  if (!world || !reveal) return null

  const courses = coursesForWorld(groupId, answered)

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-5 rounded-[48px] px-20 pt-10 pb-[var(--kiosk-chrome-clearance,240px)]">
      {/*
        The photograph sits behind the headline as texture, and is deliberately not
        one of the pictures on the cards below it — a screen that shows the same
        image twice reads as a screen with one image.
      */}
      <div className="relative flex shrink-0 flex-col gap-2">
        {reveal.hero ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-80px] top-0 bottom-0 overflow-hidden rounded-[36px]"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, black 40%, transparent), " +
                "linear-gradient(to left, transparent, black 22%, black 78%, transparent)",
              maskComposite: "intersect",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 40%, transparent), " +
                "linear-gradient(to left, transparent, black 22%, black 78%, transparent)",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Photo media={reveal.hero} className="h-full w-full opacity-[0.16]" />
          </div>
        ) : null}
        <p className="relative text-[26px] font-medium text-[var(--kiosk-money)]">
          {world.display}
        </p>
        <h2 className="display relative text-[58px] text-balance">{reveal.title}</h2>
        <p className="relative max-w-[80%] text-[25px] leading-relaxed text-[var(--kiosk-muted)]">
          {reveal.body}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2.5">
        {reveal.topics.map((topic) => (
          <span key={topic} className="pill rounded-full px-6 py-2 text-[22px]">
            {topic}
          </span>
        ))}
      </div>

      <div
        className="mx-auto grid min-h-0 w-full flex-1 content-stretch gap-5"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, courses.length)}, minmax(0, 1fr))`,
          maxWidth: courses.length === 1 ? "760px" : courses.length === 2 ? "1200px" : "100%",
        }}
      >
        {courses.map((course, index) => {
          const price = priceFor(course.id)
          return (
            <motion.button
              key={course.id}
              type="button"
              onClick={() => camera.goTo(`course-${course.id}`, "dive")}
              initial={{ opacity: 0, y: 50 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
              className="mat flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-[32px] text-start"
            >
              {/*
                The photograph is the part of the card that gives way. It used to be
                a fixed 190px band above text of its own natural height, so when the
                row was short the summary and the price were pushed straight out
                through the bottom of the card — which is the one thing on it that
                has to be readable.
              */}
              {course.media ? (
                <Photo media={course.media} className="min-h-0 w-full flex-1 basis-0" />
              ) : null}
              <span className="flex shrink-0 flex-col gap-2 px-7 py-5">
                <b className="text-[33px] leading-tight font-bold text-balance">{course.title}</b>
                <span className="flex min-h-[2.7em] items-start text-[21px] leading-snug text-[var(--kiosk-card-muted)]">
                  {course.summary}
                </span>
                <span className="flex items-baseline justify-between gap-4 pt-1">
                  {price.regular === undefined && price.festival === undefined ? (
                    <span className="text-[21px] text-[var(--kiosk-card-muted)]">
                      قیمت را در غرفه بپرسید
                    </span>
                  ) : (
                    <span className="text-[30px] font-bold text-[var(--kiosk-accent)]">
                      {formatPrice(price.festival ?? price.regular!)}
                    </span>
                  )}
                  <span className="shrink-0 text-[23px] font-bold text-[var(--kiosk-accent)]">
                    جزئیات ←
                  </span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-6">
        <Button onClick={() => camera.goTo("connect", "dive")}>
          <Icon name="qr" size={30} />
          {reveal.cta}
        </Button>
        <Button variant="ghost" onClick={() => camera.back()}>
          یه بازی دیگه
        </Button>
      </div>

      <p className="shrink-0 text-center text-[20px] text-[var(--kiosk-muted)]">
        {content.event.contextTag}
      </p>
    </div>
  )
}
