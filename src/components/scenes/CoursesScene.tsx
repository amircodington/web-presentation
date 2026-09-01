"use client"

import { motion } from "motion/react"
import { activeCourses, coursesFor, orderProducts, priceFor } from "@/content/select"
import { formatPrice } from "@/lib/format"
import { useSession } from "@/store/session"
import { Button } from "@/components/ui/Button"
import { Photo } from "@/components/ui/Photo"
import type { SceneComponentProps } from "@/engine"

/**
 * The catalogue, filtered to the visitor's declared audience when there is one and
 * ordered the way `event.json` wants products led with.
 *
 * Falls back to everything active rather than to an empty screen, because an
 * audience with no matching course must still see something to consider.
 */
export function CoursesScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const audience = useSession((store) => store.audience)

  const matching = audience ? coursesFor(audience) : []
  const courses = (matching.length > 0 ? matching : orderProducts(activeCourses())).slice(0, 3)

  // Filtering by audience often leaves one or two cards. A fixed three-column grid
  // would strand them against a wall of empty space, so the track count follows
  // the result count.
  const columns = Math.max(1, courses.length)

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-9 rounded-[48px] px-20 pt-14 pb-60">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-[26px] font-medium text-[var(--kiosk-money)]">مسیرها</p>
          <h2 className="display text-[64px]">
            {audience ? "این‌ها برای تو انتخاب شده" : "از کجا می‌خواهی شروع کنی؟"}
          </h2>
        </div>
        <Button variant="ghost" onClick={() => camera.goTo("live")}>
          چالش‌های زنده ←
        </Button>
      </div>

      <div
        className="mx-auto grid w-full flex-1 content-center gap-7"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          maxWidth: columns === 1 ? "760px" : columns === 2 ? "1200px" : "100%",
        }}
      >
        {courses.map((course, index) => {
          const price = priceFor(course.id)
          return (
            <motion.button
              key={course.id}
              type="button"
              onClick={() => camera.goTo(`course-${course.id}`, "dive")}
              initial={{ opacity: 0, y: 60 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              className="mat relative flex h-[470px] cursor-pointer flex-col overflow-hidden rounded-[32px] text-start"
            >
              {index === 0 ? (
                <span className="absolute end-6 top-6 z-10 rounded-full bg-[var(--kiosk-accent)] px-6 py-2 text-[21px] font-bold text-[var(--kiosk-on-accent)]">
                  پیشنهاد اول
                </span>
              ) : null}

              {course.media ? <Photo media={course.media} className="h-[210px] w-full" /> : null}

              <div className="flex flex-1 flex-col gap-4 p-9">
                <h3 className="text-[40px] leading-tight font-bold">{course.title}</h3>
                <p className="text-[25px] leading-relaxed text-[var(--kiosk-card-muted)]">
                  {course.summary}
                </p>
                {course.targetAge ? (
                  <span className="pill-on-mat w-fit rounded-full px-5 py-1.5 text-[22px]">
                    {course.targetAge}
                  </span>
                ) : null}

                <div className="mt-auto flex w-full items-baseline justify-between gap-4 pt-3">
                  <PriceBlock regular={price.regular} festival={price.festival} />
                  <span className="text-[25px] font-bold text-[var(--kiosk-accent)]">جزئیات ←</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Renders the festival price alongside the struck-through regular one. When the
 * offer is off, `festival` is absent and only the regular price shows — no
 * half-priced card is ever left stranded on screen.
 */
function PriceBlock({ regular, festival }: { regular?: number; festival?: number }) {
  if (regular === undefined && festival === undefined) {
    return <p className="text-[25px] text-[var(--kiosk-card-muted)]">قیمت را در غرفه بپرسید</p>
  }

  return (
    <div className="flex items-baseline gap-4">
      {festival !== undefined ? (
        <>
          <span className="text-[36px] font-bold text-[var(--kiosk-accent)]">
            {formatPrice(festival)}
          </span>
          {regular !== undefined ? (
            <span className="text-[24px] text-[var(--kiosk-card-muted)] line-through">
              {formatPrice(regular)}
            </span>
          ) : null}
        </>
      ) : (
        <span className="text-[36px] font-bold">{formatPrice(regular!)}</span>
      )}
    </div>
  )
}
