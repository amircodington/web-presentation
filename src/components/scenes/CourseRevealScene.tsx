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
    <div className="scene-surface flex h-full w-full flex-col gap-8 rounded-[48px] px-20 pt-14 pb-60">
      <div className="flex flex-col gap-3">
        <p className="text-[27px] font-medium text-[var(--kiosk-money)]">{world.display}</p>
        <h2 className="display text-[68px] text-balance">{reveal.title}</h2>
        <p className="max-w-[80%] text-[28px] leading-relaxed text-[var(--kiosk-muted)]">
          {reveal.body}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {reveal.topics.map((topic) => (
          <span key={topic} className="pill rounded-full px-7 py-3 text-[25px]">
            {topic}
          </span>
        ))}
      </div>

      <div
        className="mx-auto grid min-h-0 w-full flex-1 content-center gap-6"
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
              onClick={() => camera.goTo("connect", "dive")}
              initial={{ opacity: 0, y: 50 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ x: 9, y: 9, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
              className="mat flex cursor-pointer flex-col overflow-hidden rounded-[32px] text-start"
            >
              {course.media ? <Photo media={course.media} className="h-[190px] w-full" /> : null}
              <span className="flex flex-1 flex-col gap-3 p-8">
                <b className="text-[38px] leading-tight font-bold">{course.title}</b>
                <span className="text-[24px] leading-relaxed text-[var(--kiosk-card-muted)]">
                  {course.summary}
                </span>
                <span className="mt-auto flex items-baseline justify-between gap-4 pt-3">
                  {price.regular === undefined && price.festival === undefined ? (
                    <span className="text-[24px] text-[var(--kiosk-card-muted)]">
                      قیمت را در غرفه بپرسید
                    </span>
                  ) : (
                    <span className="text-[34px] font-bold text-[var(--kiosk-accent)]">
                      {formatPrice(price.festival ?? price.regular!)}
                    </span>
                  )}
                  <span className="text-[25px] font-bold text-[var(--kiosk-accent)]">جزئیات ←</span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-6">
        <Button onClick={() => camera.goTo("connect", "dive")}>
          <Icon name="qr" size={30} />
          {reveal.cta}
        </Button>
        <Button variant="ghost" onClick={() => camera.back()}>
          یه بازی دیگه
        </Button>
      </div>

      <p className="text-center text-[21px] text-[var(--kiosk-muted)]">
        {content.event.contextTag}
      </p>
    </div>
  )
}
