import { content } from "@/content/load"
import { orderProducts } from "@/content/select"
import type { AudienceId } from "@/content/schema/common"
import type { ResultBand } from "@/content/schema/quiz"

export type Answers = Readonly<Record<string, string>>

/**
 * Sums the scores of the chosen options.
 *
 * Pure: answers in, number out. No store access and no side effects, which is
 * what makes the highest-risk logic in the product testable without a browser.
 * Unanswered and unrecognised options contribute zero rather than throwing —
 * a visitor who skips ahead must still reach a result.
 */
export function scoreAnswers(answers: Answers): number {
  let total = 0
  for (const question of content.quiz.questions) {
    const chosen = answers[question.id]
    if (!chosen) continue
    const option = question.options.find((candidate) => candidate.id === chosen)
    if (option) total += option.score
  }
  return total
}

/**
 * The score rebased onto 0–100.
 *
 * The attract loop asks "how much out of 100 is your financial intelligence?", so
 * the result has to answer that question in the units it was asked in. The raw
 * score stays the unit the bands are defined in — rebasing there would force the
 * content team to re-derive every boundary whenever a question is added.
 */
export function scoreOutOfHundred(score: number): number {
  const max = maxScore()
  return max > 0 ? Math.round((score / max) * 100) : 0
}

/** The highest score the quiz can produce. Used to draw the progress meter. */
export function maxScore(): number {
  return content.quiz.questions.reduce(
    (total, question) => total + Math.max(...question.options.map((option) => option.score)),
    0,
  )
}

/**
 * Maps a score to its result band.
 *
 * The schema guarantees the bands tile the range with no gap, so the fallback to
 * the nearest band only fires for scores outside the quiz's own range.
 */
export function bandFor(score: number): ResultBand {
  const exact = content.results.find((band) => score >= band.minScore && score <= band.maxScore)
  if (exact) return exact
  const sorted = [...content.results].sort((a, b) => a.minScore - b.minScore)
  return score < sorted[0]!.minScore ? sorted[0]! : sorted[sorted.length - 1]!
}

/**
 * Ordered product ids to recommend.
 *
 * The band decides which products are relevant; `event.json` decides which of them
 * leads. When the visitor has declared an audience, products matching it are
 * promoted ahead of the rest — a parent and a student can reach the same score and
 * should not be sold the same thing.
 */
export function recommendFor(score: number, audience?: AudienceId): readonly string[] {
  const band = bandFor(score)
  const ranked = orderProducts(
    band.recommendedProducts.map((id) => ({ id })),
    audience,
  ).map((entry) => entry.id)
  if (!audience) return ranked

  const matching: string[] = []
  const rest: string[] = []
  for (const id of ranked) {
    const course = content.courses.find((candidate) => candidate.id === id)
    if (course?.audiences.includes(audience)) matching.push(id)
    else rest.push(id)
  }
  return [...matching, ...rest]
}
