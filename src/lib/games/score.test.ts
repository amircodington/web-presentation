import { describe, expect, it } from "vitest"
import { answerRound, countCorrect, emptyAnswers, isAnswered } from "./score"

type Direction = "up" | "down"

const EXPECTED: Direction[] = ["up", "up", "down", "up", "down"]

/** Plays every round with the given choice picker, one touch per round. */
function play(pick: (index: number) => Direction) {
  let answers = emptyAnswers<Direction>(EXPECTED.length)
  for (let index = 0; index < EXPECTED.length; index += 1) {
    answers = answerRound(answers, index, pick(index))
  }
  return answers
}

describe("emptyAnswers", () => {
  it("holds one unanswered slot per round", () => {
    expect(emptyAnswers(3)).toEqual([undefined, undefined, undefined])
  })

  it("treats a negative count as no rounds", () => {
    expect(emptyAnswers(-1)).toEqual([])
  })
})

describe("countCorrect", () => {
  it("scores a perfect game as every round", () => {
    expect(countCorrect(play((index) => EXPECTED[index]!), EXPECTED)).toBe(EXPECTED.length)
  })

  it("scores a game answered wrongly throughout as zero", () => {
    const wrong = (index: number): Direction => (EXPECTED[index] === "up" ? "down" : "up")
    expect(countCorrect(play(wrong), EXPECTED)).toBe(0)
  })

  it("scores unanswered rounds as nothing", () => {
    expect(countCorrect(emptyAnswers<Direction>(EXPECTED.length), EXPECTED)).toBe(0)
  })

  it("never exceeds the number of rounds", () => {
    const answers = play((index) => EXPECTED[index]!)
    expect(countCorrect(answers, EXPECTED)).toBeLessThanOrEqual(EXPECTED.length)
  })
})

describe("answerRound", () => {
  it("keeps the first answer when a round is tapped twice", () => {
    let answers = emptyAnswers<Direction>(3)
    answers = answerRound(answers, 0, "up")
    answers = answerRound(answers, 0, "down")
    expect(answers[0]).toBe("up")
  })

  it("returns the same record when a repeat tap changes nothing", () => {
    const first = answerRound(emptyAnswers<Direction>(3), 1, "up")
    expect(answerRound(first, 1, "down")).toBe(first)
  })

  it("ignores an index outside the game", () => {
    const answers = emptyAnswers<Direction>(2)
    expect(answerRound(answers, 2, "up")).toBe(answers)
    expect(answerRound(answers, -1, "up")).toBe(answers)
  })

  it("does not inflate the score when every round is double-tapped", () => {
    let answers = emptyAnswers<Direction>(EXPECTED.length)
    for (let index = 0; index < EXPECTED.length; index += 1) {
      answers = answerRound(answers, index, EXPECTED[index]!)
      answers = answerRound(answers, index, EXPECTED[index]!)
      answers = answerRound(answers, index, EXPECTED[index]!)
    }
    expect(countCorrect(answers, EXPECTED)).toBe(EXPECTED.length)
  })

  it("does not let a second tap on another choice rewrite a correct round", () => {
    let answers = emptyAnswers<Direction>(EXPECTED.length)
    for (let index = 0; index < EXPECTED.length; index += 1) {
      answers = answerRound(answers, index, EXPECTED[index]!)
      answers = answerRound(answers, index, EXPECTED[index] === "up" ? "down" : "up")
    }
    expect(countCorrect(answers, EXPECTED)).toBe(EXPECTED.length)
  })
})

describe("isAnswered", () => {
  it("reports a round only once it holds a choice", () => {
    const answers = answerRound(emptyAnswers<Direction>(2), 0, "up")
    expect(isAnswered(answers, 0)).toBe(true)
    expect(isAnswered(answers, 1)).toBe(false)
  })
})
