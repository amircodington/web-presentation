"use client"

import { motion } from "motion/react"
import { activeCourses, coursesFor, priceFor } from "@/content/select"
import { formatPrice } from "@/lib/format"
import { useSession } from "@/store/session"
import { Button } from "@/components/ui/Button"
import type { SceneComponentProps } from "@/engine"

/**
 * The catalogue, filtered to the visitor's declared audience when there is one.
 * Falls back to everything active rather than to an empty screen, because an
 * audience with no matching course must still see something to consider.
 */
export function CoursesScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const audience = useSession((store) => store.audience)

  const matching = audience ? coursesFor(audience) : []
  const courses = (matching.length > 0 ? matching : activeCourses()).slice(0, 3)

  // Filtering by audience often leaves one or two cards. A fixed three-column grid
  // would strand them against a wall of empty space, so the track count follows
  // the result count.
  const columns = Math.max(1, courses.length)

  return (
    <div className="scene-surface flex h-full w-full flex-col justify-center gap-12 rounded-[48px] px-24 pt-16 pb-52">
      <div className="flex items-end justify-between gap-10">
        <div className="flex flex-col gap-4">
          <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">دوره‌ها</p>
          <h2 className="text-[72px] leading-[1.15] font-bold">
            {audience ? "این‌ها برای تو انتخاب شده‌اند" : "مسیرهای یادگیری"}
          </h2>
        </div>
        <Button variant="ghost" onClick={() => camera.goTo("live")}>
          فعالیت‌های زنده ←
        </Button>
      </div>

      <div
        className="mx-auto grid w-full gap-7"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          maxWidth: columns === 1 ? "720px" : columns === 2 ? "1180px" : "100%",
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
              className="flex min-h-[430px] cursor-pointer flex-col justify-between rounded-3xl border-2 border-white/10 bg-white/[0.04] p-10 text-start"
            >
              <div className="flex flex-col gap-5">
                <h3 className="text-[42px] leading-tight font-bold">{course.title}</h3>
                <p className="text-[27px] leading-relaxed text-[var(--kiosk-muted)]">
                  {course.summary}
                </p>
                {course.targetAge ? (
                  <span className="w-fit rounded-full bg-white/8 px-6 py-2 text-[24px]">
                    {course.targetAge}
                  </span>
                ) : null}
              </div>

              <div className="flex w-full items-baseline justify-between gap-4">
                <PriceBlock regular={price.regular} festival={price.festival} />
                <span className="text-[26px] text-[var(--kiosk-accent)]">جزئیات ←</span>
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
    return <p className="text-[28px] text-[var(--kiosk-muted)]">قیمت را در غرفه بپرسید</p>
  }

  return (
    <div className="flex items-baseline gap-5">
      {festival !== undefined ? (
        <>
          <span className="text-[40px] font-bold text-[var(--kiosk-accent)]">
            {formatPrice(festival)}
          </span>
          {regular !== undefined ? (
            <span className="text-[26px] text-[var(--kiosk-muted)] line-through">
              {formatPrice(regular)}
            </span>
          ) : null}
        </>
      ) : (
        <span className="text-[40px] font-bold">{formatPrice(regular!)}</span>
      )}
    </div>
  )
}
