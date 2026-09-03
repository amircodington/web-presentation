"use client"

import { motion } from "motion/react"
import { productById, priceFor } from "@/content/select"
import { formatPrice } from "@/lib/format"
import { Icon } from "@/components/ui/Icon"
import { Photo } from "@/components/ui/Photo"
import type { SceneComponentProps } from "@/engine"

/**
 * Full detail for one course, selected by `props.courseId` in `scenes.json`.
 * One component serves every course, so adding a course page is a content edit.
 */
export function CourseDetailScene({ state, props }: SceneComponentProps) {
  const isActive = state === "active"
  const course = productById(String(props.courseId ?? ""))

  if (!course || !("curriculum" in course)) return null

  const price = priceFor(course.id)
  const logistics = course.logistics
  // The poster is the better artwork where there is a full-height column to give it.
  const artwork = course.campaignPoster ?? course.media

  return (
    <div className="scene-surface flex h-full w-full gap-12 rounded-[48px] px-16 pt-14 pb-[var(--kiosk-chrome-clearance,240px)]">
      {artwork ? <Photo media={artwork} className="w-[23%] shrink-0 rounded-[32px]" /> : null}

      <div className="flex w-[34%] shrink-0 flex-col justify-center gap-6">
        {course.campaignTitle ? (
          <p className="text-[28px] font-bold text-[var(--kiosk-money)]">{course.campaignTitle}</p>
        ) : null}

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.75, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="display text-[50px] text-balance"
        >
          {course.heroTitle}
        </motion.h2>

        {course.heroSubtitle ? (
          <p className="text-[27px] leading-relaxed text-[var(--kiosk-muted)]">
            {course.heroSubtitle}
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {course.highlights.map((item) => (
            <li key={item} className="flex items-center gap-4 text-[26px]">
              <span className="text-[var(--kiosk-positive)]">
                <Icon name="check" size={26} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        {logistics ? <Logistics logistics={logistics} /> : null}

        <p className="text-[30px] font-bold">
          {price.festival !== undefined
            ? formatPrice(price.festival)
            : price.regular !== undefined
              ? formatPrice(price.regular)
              : "شرایط ثبت‌نام را در غرفه بپرسید"}
        </p>
      </div>

      {/*
        A long syllabus does not fit one column at kiosk type sizes. Splitting past
        four blocks keeps every block at a readable size instead of shrinking the
        text until it fails the 22px floor.
      */}
      <div
        className="grid flex-1 content-center gap-4"
        style={{
          gridTemplateColumns: course.curriculum.length > 4 ? "repeat(2, minmax(0, 1fr))" : "1fr",
        }}
      >
        {course.curriculum.map((block, index) => (
          <motion.div
            key={block.title}
            initial={{ opacity: 0, x: -50 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="mat rounded-2xl px-7 py-4"
          >
            <h3 className="text-[28px] font-bold text-[var(--kiosk-accent)]">{block.title}</h3>
            <p className="text-[23px] leading-relaxed text-[var(--kiosk-card-muted)]">
              {block.items.join(" · ")}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Logistics({
  logistics,
}: {
  logistics: NonNullable<Extract<ReturnType<typeof productById>, { curriculum: unknown }>["logistics"]>
}) {
  const rows = [
    logistics.startDate ? `شروع: ${logistics.startDate}` : null,
    logistics.weekday && logistics.time ? `${logistics.weekday} ${logistics.time}` : null,
    logistics.location,
    logistics.deliveryModes.length > 0 ? logistics.deliveryModes.join(" / ") : null,
    logistics.capacityDisplay,
  ].filter((row): row is string => Boolean(row))

  if (rows.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {rows.map((row) => (
        <span key={row} className="pill rounded-full px-5 py-2 text-[22px]">
          {row}
        </span>
      ))}
    </div>
  )
}
