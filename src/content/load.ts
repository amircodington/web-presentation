import { z } from "zod"
import audiencesJson from "@content/audiences.json"
import brandJson from "@content/brand.json"
import contactJson from "@content/contact.json"
import coursesJson from "@content/courses.json"
import festivalJson from "@content/festival.json"
import qrJson from "@content/qr.json"
import quizJson from "@content/quiz.json"
import resultsJson from "@content/results.json"
import scenesJson from "@content/scenes.json"
import workshopsJson from "@content/workshops.json"
import { BrandSchema } from "./schema/brand"
import { AudiencesSchema, CoursesSchema, WorkshopsSchema } from "./schema/catalogue"
import { ContactSchema, FestivalSchema, QrSchema } from "./schema/festival"
import { QuizSchema, ResultsSchema } from "./schema/quiz"
import { ScenesSchema } from "./schema/scenes"

/**
 * Parses and freezes every content file.
 *
 * This module is the only permitted route to `content/`. A component importing a
 * JSON file directly bypasses validation, which is how an unvalidated placeholder
 * ends up on a two-metre screen in front of the public.
 *
 * Validation runs at build time via `scripts/validate-content.ts` and again here
 * at runtime, so a file swapped into a running container at the booth is still
 * caught.
 */
function parse<T>(name: string, schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw)
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`content/${name}.json failed validation:\n${detail}`)
  }
  return result.data
}

const brand = parse("brand", BrandSchema, brandJson)
const festival = parse("festival", FestivalSchema, festivalJson)
const contact = parse("contact", ContactSchema, contactJson)
const qr = parse("qr", QrSchema, qrJson)
const courses = parse("courses", CoursesSchema, coursesJson)
const workshops = parse("workshops", WorkshopsSchema, workshopsJson)
const audiences = parse("audiences", AudiencesSchema, audiencesJson)
const quiz = parse("quiz", QuizSchema, quizJson)
const results = parse("results", ResultsSchema, resultsJson)
const scenes = parse("scenes", ScenesSchema, scenesJson)

/** Invariants that span files and so cannot live in any single schema. */
function checkCrossReferences(): void {
  const productIds = new Set([...courses, ...workshops].map((item) => item.id))
  for (const band of results) {
    for (const id of band.recommendedProducts) {
      if (!productIds.has(id)) {
        throw new Error(
          `content/results.json: band "${band.id}" recommends unknown product "${id}"`,
        )
      }
    }
  }

  const audienceIds = new Set(audiences.map((audience) => audience.id))
  for (const course of courses) {
    for (const id of course.audiences) {
      if (!audienceIds.has(id)) {
        throw new Error(`content/courses.json: course "${course.id}" targets unknown audience "${id}"`)
      }
    }
  }
}

checkCrossReferences()

export const content = Object.freeze({
  brand,
  festival,
  contact,
  qr,
  courses,
  workshops,
  audiences,
  quiz,
  results,
  scenes,
})

export type Content = typeof content
