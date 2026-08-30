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
  questions: content.quiz.questions.length,
  resultBands: content.results.length,
}

const maxScore = content.quiz.questions.reduce(
  (total, question) => total + Math.max(...question.options.map((option) => option.score)),
  0,
)
const topBand = Math.max(...content.results.map((band) => band.maxScore))

if (topBand < maxScore) {
  console.error(
    `content/results.json: highest band ends at ${topBand} but the quiz can score ${maxScore}.`,
  )
  process.exit(1)
}

console.log("content ok:", JSON.stringify(counts))
