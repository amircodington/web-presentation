import { describe, expect, it } from "vitest"
import { content } from "@/content/load"
import { bandFor, maxScore, recommendFor, scoreAnswers } from "./scoring"

describe("scoreAnswers", () => {
  it("returns zero for no answers", () => {
    expect(scoreAnswers({})).toBe(0)
  })

  it("sums the chosen options", () => {
    const answers = Object.fromEntries(
      content.quiz.questions.map((question) => [question.id, question.options[0]!.id]),
    )
    const expected = content.quiz.questions.reduce((t, q) => t + q.options[0]!.score, 0)
    expect(scoreAnswers(answers)).toBe(expected)
  })

  it("reaches the maximum when every top option is chosen", () => {
    const answers = Object.fromEntries(
      content.quiz.questions.map((question) => [
        question.id,
        [...question.options].sort((a, b) => b.score - a.score)[0]!.id,
      ]),
    )
    expect(scoreAnswers(answers)).toBe(maxScore())
  })

  it("ignores unknown questions and options rather than throwing", () => {
    expect(scoreAnswers({ nonexistent: "nope" })).toBe(0)
    expect(scoreAnswers({ [content.quiz.questions[0]!.id]: "nope" })).toBe(0)
  })
})

describe("bandFor", () => {
  it("returns a band for every reachable score", () => {
    for (let score = 0; score <= maxScore(); score += 1) {
      expect(bandFor(score), `score ${score}`).toBeDefined()
    }
  })

  it("makes every band reachable", () => {
    const reached = new Set<string>()
    for (let score = 0; score <= maxScore(); score += 1) reached.add(bandFor(score).id)
    expect(reached.size).toBe(content.results.length)
  })

  it("clamps scores outside the range", () => {
    expect(bandFor(-5).id).toBe(bandFor(0).id)
    expect(bandFor(999).id).toBe(bandFor(maxScore()).id)
  })
})

describe("recommendFor", () => {
  it("always resolves to real products", () => {
    const ids = new Set([...content.courses, ...content.workshops].map((item) => item.id))
    for (let score = 0; score <= maxScore(); score += 1) {
      for (const id of recommendFor(score)) expect(ids.has(id)).toBe(true)
    }
  })

  it("promotes products matching the declared audience", () => {
    const ranked = recommendFor(maxScore(), "organization")
    const unranked = recommendFor(maxScore())
    expect([...ranked].sort()).toEqual([...unranked].sort())
    expect(ranked[0]).toBe("org-program")
  })
})
