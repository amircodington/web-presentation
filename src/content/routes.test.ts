import { describe, expect, it } from "vitest"
import { content } from "./load"
import { activeCourses, coursesForWorld } from "./select"

/**
 * `camera.goTo` returns silently when no scene carries the id it was given, so a
 * scene that has been renamed or was never authored becomes a button that does
 * nothing. On an unattended screen in a hall that is worse than a crash: nobody
 * is watching, and the visitor concludes the kiosk is broken and walks away.
 *
 * These tests walk the edges the components build at runtime and assert each one
 * lands somewhere. They are content tests, not component tests — the bug they
 * guard against is always a scene missing from `scenes.json`.
 */

const sceneIds = new Set(content.scenes.scenes.map((scene) => scene.id))

describe("scene graph", () => {
  it("has no scene pointing at a scene that does not exist", () => {
    for (const scene of content.scenes.scenes) {
      for (const edge of ["next", "back"] as const) {
        const target = scene[edge]
        if (target !== undefined) {
          expect(sceneIds.has(target), `${scene.id}.${edge} → ${target}`).toBe(true)
        }
      }
    }
  })

  it("starts on a scene that exists", () => {
    expect(sceneIds.has(content.scenes.initialScene)).toBe(true)
  })
})

describe("world reveals", () => {
  it("names a scene that exists", () => {
    for (const world of content.worlds.worlds) {
      if (world.reveal) {
        expect(sceneIds.has(world.reveal.scene), `${world.id} reveal`).toBe(true)
      }
    }
  })

  it("only offers courses that have a detail scene to open", () => {
    // `CourseRevealScene` routes every card it renders to `course-<id>`.
    for (const world of content.worlds.worlds) {
      for (const course of coursesForWorld(world.id)) {
        expect(sceneIds.has(`course-${course.id}`), `${world.id} → course-${course.id}`).toBe(true)
      }
    }
  })
})

describe("world experiences", () => {
  it("name scenes that exist", () => {
    for (const world of content.worlds.worlds) {
      for (const experience of world.experiences) {
        expect(sceneIds.has(experience.scene), `${world.id}/${experience.id}`).toBe(true)
      }
      if (world.diagnostic) {
        expect(sceneIds.has(world.diagnostic.scene), `${world.id} diagnostic`).toBe(true)
      }
    }
  })
})

describe("the catalogue", () => {
  it("gives every active course a detail scene", () => {
    for (const course of activeCourses()) {
      expect(sceneIds.has(`course-${course.id}`), course.id).toBe(true)
    }
  })

  it("points every course detail scene at a course that exists", () => {
    const courseIds = new Set(content.courses.map((course) => course.id))
    for (const scene of content.scenes.scenes) {
      if (scene.component !== "CourseDetailScene") continue
      const courseId = String(scene.props?.courseId ?? "")
      expect(courseIds.has(courseId), `${scene.id} → ${courseId}`).toBe(true)
    }
  })
})

describe("the gateway", () => {
  it("names a scene that exists for its secondary route", () => {
    const secondary = content.worlds.gateway.secondary
    if (secondary) expect(sceneIds.has(secondary.scene)).toBe(true)
  })
})
