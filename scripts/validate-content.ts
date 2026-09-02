/**
 * Build-time gate over `content/`. Importing the loader is enough: it parses every
 * file, freezes the result, and throws on the first failure with a readable path.
 *
 * Wired into `npm run build` so a bad content edit fails the build rather than
 * reaching a two-metre screen in front of the public.
 */
import { content } from "../src/content/load"

const counts = {
  scenes: content.scenes.scenes.length,
  courses: content.courses.length,
  workshops: content.workshops.length,
  audiences: content.audiences.length,
  adultScenarios: content.adultScenarios.scenarios.length,
  collaborationTracks: 2,
  liveActivities: content.activities.activities.length,
}

// Scenes that overlap in canvas space look broken in the overview map and make
// the `dive` transition fly through content it should be passing over.
const { designSize, scenes } = content.scenes
const boxes = scenes.map((scene) => {
  const { x, y, scale, rotate } = scene.camera
  const theta = (rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(theta))
  const sin = Math.abs(Math.sin(theta))
  const w = (designSize.width * cos + designSize.height * sin) * scale
  const h = (designSize.width * sin + designSize.height * cos) * scale
  return { id: scene.id, minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2 }
})

const collisions: string[] = []
for (let i = 0; i < boxes.length; i += 1) {
  for (let j = i + 1; j < boxes.length; j += 1) {
    const a = boxes[i]!
    const b = boxes[j]!
    const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
    const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY)
    if (overlapX > 0 && overlapY > 0) {
      collisions.push(`  ${a.id} ↔ ${b.id} (${Math.round(overlapX)}×${Math.round(overlapY)}px)`)
    }
  }
}

if (collisions.length > 0) {
  console.error("content/scenes.json: scenes overlap on the canvas:\n" + collisions.join("\n"))
  process.exit(1)
}


console.log("content ok:", JSON.stringify(counts))
