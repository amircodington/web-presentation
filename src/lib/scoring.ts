import { content } from "@/content/load"
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
 * The band's own recommendations lead. When the visitor has declared an audience,
 * products matching it are promoted ahead of the rest — a parent and a student can
 * reach the same score and should not be sold the same thing.
 */
export function recommendFor(score: number, audience?: string): readonly string[] {
  const band = bandFor(score)
  if (!audience) return band.recommendedProducts

  const matching: string[] = []
  const rest: string[] = []
  for (const id of band.recommendedProducts) {
    const course = content.courses.find((candidate) => candidate.id === id)
    if (course?.audiences.includes(audience as never)) matching.push(id)
    else rest.push(id)
  }
  return [...matching, ...rest]
}
