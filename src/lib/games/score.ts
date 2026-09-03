/**
 * Scoring for the round-based games — one choice per round, one point per match.
 *
 * The score is derived from a record of what was answered rather than accumulated
 * as rounds are played, and that is the whole point of this module. A counter
 * incremented inside a tap handler is only correct if every tap is the first one
 * for its round, and on a touchscreen it is not: a finger bounces, a second visitor
 * reaches in, and a button stays hit-testable through its exit animation. Any of
 * those scored the same round twice and the game reported a total larger than the
 * number of rounds it had.
 *
 * Recording instead of counting makes a repeat tap a no-op by construction, so the
 * total cannot drift no matter how the screen is touched.
 */

/**
 * What the visitor chose in each round, indexed by round.
 *
 * `undefined` means the round has not been answered yet — distinct from a round
 * answered wrongly, which the score needs to tell apart.
 */
export type RoundAnswers<Choice extends string> = readonly (Choice | undefined)[]

/** A record of `rounds` unanswered rounds. */
export function emptyAnswers<Choice extends string>(rounds: number): RoundAnswers<Choice> {
  return Array.from({ length: Math.max(0, rounds) }, () => undefined)
}

/**
 * Records `choice` for one round.
 *
 * A round that already holds an answer keeps it, and an index outside the game is
 * ignored: the first touch decides the round, and everything after it is noise.
 * Returns the same array when nothing changed, so a re-render is not triggered by
 * a tap that did nothing.
 */
export function answerRound<Choice extends string>(
  answers: RoundAnswers<Choice>,
  index: number,
  choice: Choice,
): RoundAnswers<Choice> {
  if (index < 0 || index >= answers.length) return answers
  if (answers[index] !== undefined) return answers

  const next = [...answers]
  next[index] = choice
  return next
}

/** Whether the round at `index` has been answered. */
export function isAnswered<Choice extends string>(
  answers: RoundAnswers<Choice>,
  index: number,
): boolean {
  return answers[index] !== undefined
}

/**
 * How many rounds were answered correctly.
 *
 * `expected[i]` is the right choice for round `i`. Rounds left unanswered score
 * nothing, and the result can never exceed `expected.length`.
 */
export function countCorrect<Choice extends string>(
  answers: RoundAnswers<Choice>,
  expected: readonly Choice[],
): number {
  return expected.reduce(
    (total, right, index) => (answers[index] === right ? total + 1 : total),
    0,
  )
}
