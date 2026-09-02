import { z } from "zod"
import activitiesJson from "@content/activities.json"
import audioJson from "@content/audio.json"
import audiencesJson from "@content/audiences.json"
import boothJson from "@content/booth.json"
import brandJson from "@content/brand.json"
import contactJson from "@content/contact.json"
import collaborationJson from "@content/collaboration.json"
import coursesJson from "@content/courses.json"
import eventJson from "@content/event.json"
import festivalJson from "@content/festival.json"
import qrJson from "@content/qr.json"
import quizJson from "@content/quiz.json"
import resultsJson from "@content/results.json"
import scenesJson from "@content/scenes.json"
import worldsJson from "@content/worlds.json"
import workshopsJson from "@content/workshops.json"
import { AudioSchema } from "./schema/audio"
import { BoothSchema } from "./schema/booth"
import { BrandSchema } from "./schema/brand"
import { ActivitiesSchema } from "./schema/activities"
import { AudiencesSchema, CoursesSchema, WorkshopsSchema } from "./schema/catalogue"
import { CollaborationSchema } from "./schema/collaboration"
import { EventSchema } from "./schema/event"
import { ContactSchema, FestivalSchema, QrSchema } from "./schema/festival"
import { QuizSchema, ResultsSchema } from "./schema/quiz"
import { ScenesSchema } from "./schema/scenes"
import { WorldsSchema } from "./schema/worlds"

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
const audio = parse("audio", AudioSchema, audioJson)
const booth = parse("booth", BoothSchema, boothJson)
const festival = parse("festival", FestivalSchema, festivalJson)
const event = parse("event", EventSchema, eventJson)
const contact = parse("contact", ContactSchema, contactJson)
const qr = parse("qr", QrSchema, qrJson)
const courses = parse("courses", CoursesSchema, coursesJson)
const workshops = parse("workshops", WorkshopsSchema, workshopsJson)
const audiences = parse("audiences", AudiencesSchema, audiencesJson)
const quiz = parse("quiz", QuizSchema, quizJson)
const results = parse("results", ResultsSchema, resultsJson)
const scenes = parse("scenes", ScenesSchema, scenesJson)
const worlds = parse("worlds", WorldsSchema, worldsJson)
const collaboration = parse("collaboration", CollaborationSchema, collaborationJson)
const activities = parse("activities", ActivitiesSchema, activitiesJson)

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

  const qrKeys = new Set(Object.keys(qr))
  for (const course of courses) {
    if (course.qrKey && !qrKeys.has(course.qrKey)) {
      throw new Error(`content/courses.json: course "${course.id}" has unknown qrKey "${course.qrKey}"`)
    }
  }
  for (const track of [collaboration.schools, collaboration.organizations]) {
    if (!qrKeys.has(track.qrKey)) {
      throw new Error(`content/collaboration.json: "${track.id}" has unknown qrKey "${track.qrKey}"`)
    }
  }

  const activityIds = new Set(activities.activities.map((activity) => activity.id))
  for (const slot of event.schedule) {
    if (!activityIds.has(slot.activityId)) {
      throw new Error(
        `content/event.json: slot ${slot.time} runs unknown activity "${slot.activityId}"`,
      )
    }
  }

  const orderedIds = [
    ...event.defaultProductOrder,
    ...Object.values(event.audienceProductOrder).flat().filter((id) => id !== undefined),
  ]
  for (const id of orderedIds) {
    if (!productIds.has(id)) {
      throw new Error(`content/event.json: product order names unknown product "${id}"`)
    }
  }

  const audienceIds = new Set(audiences.map((audience) => audience.id))

  for (const world of worlds.worlds) {
    if (audio.worldVolume[world.id] === undefined) {
      throw new Error(`content/audio.json: no worldVolume for "${world.id}"`)
    }
    if (world.greetingCue && audio.cues[world.greetingCue] === undefined) {
      throw new Error(
        `content/worlds.json: world "${world.id}" greets with unknown cue "${world.greetingCue}"`,
      )
    }
  }

  const sceneIds = new Set(scenes.scenes.map((scene) => scene.id))
  const sceneWorlds = new Map(scenes.scenes.map((scene) => [scene.id, scene.meta?.world]))

  if (!sceneIds.has(worlds.gateway.secondary.scene)) {
    throw new Error(
      `content/worlds.json: the secondary route points at unknown scene "${worlds.gateway.secondary.scene}"`,
    )
  }

  for (const world of worlds.worlds) {
    for (const audience of world.audiences) {
      if (!audienceIds.has(audience)) {
        throw new Error(`content/worlds.json: world "${world.id}" targets unknown audience "${audience}"`)
      }
    }
    // Only what is switched on is checked. An inactive entry names the scene it
    // will use once it is built, which is a forward declaration rather than a
    // broken link — and switching it on is what makes the check bite.
    for (const entry of [...world.experiences, ...(world.diagnostic ? [world.diagnostic] : [])]) {
      if (!entry.active) continue
      if (!sceneIds.has(entry.scene)) {
        throw new Error(
          `content/worlds.json: "${entry.id}" is active but points at unknown scene "${entry.scene}"`,
        )
      }
      // An active experience dressed in another world's palette is a visitor
      // walking through a door and finding a different room behind it.
      if (sceneWorlds.get(entry.scene) !== world.id) {
        throw new Error(
          `content/worlds.json: "${entry.id}" is active in world "${world.id}" but scene ` +
            `"${entry.scene}" is marked meta.world "${sceneWorlds.get(entry.scene) ?? "none"}"`,
        )
      }
    }
    if (!world.experiences.some((experience) => experience.active) && !world.diagnostic?.active) {
      throw new Error(`content/worlds.json: world "${world.id}" has nothing active to offer`)
    }
  }

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
  audio,
  booth,
  festival,
  event,
  contact,
  qr,
  courses,
  workshops,
  audiences,
  quiz,
  results,
  scenes,
  worlds,
  collaboration,
  activities,
})

export type Content = typeof content
