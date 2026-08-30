import { z } from "zod"
import { AudienceIdSchema } from "./common"

const QuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  hint: z.string().optional(),
  options: z
    .array(z.object({ id: z.string().min(1), label: z.string().min(1), score: z.number().int() }))
    .min(2, "a question needs at least two options"),
})

export const QuizSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
})

const ResultBandSchema = z.object({
  id: z.string().min(1),
  minScore: z.number().int(),
  maxScore: z.number().int(),
  headline: z.string().min(1),
  description: z.string().min(1),
  recommendedProducts: z.array(z.string().min(1)).min(1),
  audiences: z.array(AudienceIdSchema).default([]),
})

/**
 * Result bands must tile the reachable score range with no gap and no overlap —
 * a gap means a visitor completes the quiz and is shown nothing, which is the
 * worst possible outcome at the moment of highest engagement.
 */
export const ResultsSchema = z.array(ResultBandSchema).min(1).superRefine((bands, ctx) => {
  const sorted = [...bands].sort((a, b) => a.minScore - b.minScore)
  for (const band of sorted) {
    if (band.minScore > band.maxScore) {
      ctx.addIssue({ code: "custom", message: `band "${band.id}" has minScore above maxScore` })
    }
  }
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = sorted[i - 1]!
    const current = sorted[i]!
    if (current.minScore <= previous.maxScore) {
      ctx.addIssue({ code: "custom", message: `bands "${previous.id}" and "${current.id}" overlap` })
    } else if (current.minScore !== previous.maxScore + 1) {
      ctx.addIssue({ code: "custom", message: `gap between bands "${previous.id}" and "${current.id}"` })
    }
  }
})

export type Quiz = z.infer<typeof QuizSchema>
export type ResultBand = z.infer<typeof ResultBandSchema>
