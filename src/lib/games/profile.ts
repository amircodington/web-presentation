import type { ProfileGame } from "@/content/schema/activities"

export type Answers = Readonly<Record<string, string>>

/** One dimension's standing, as a percentage of what was reachable. */
export interface DimensionScore {
  id: string
  label: string
  /** 0–100. */
  percent: number
}

export interface Profile {
  dimensions: DimensionScore[]
  /** Overall, 0–100. */
  total: number
  level: ProfileGame["levels"][number]
  /** The dimension that scored highest, and the one that scored lowest. */
  strongest?: DimensionScore
  weakest?: DimensionScore
}

/**
 * Turns answers into a profile.
 *
 * Each dimension is scored against the *best* that dimension could have scored
 * given the questions actually asked, not against a fixed maximum. Otherwise a
 * dimension that only two questions touch is permanently capped low and reads as
 * a weakness the visitor never demonstrated — which is the fastest way to make a
 * profile untrustworthy to the person reading it about themselves.
 */
export function buildProfile(game: ProfileGame, answers: Answers): Profile {
  const earned = new Map<string, number>()
  const available = new Map<string, number>()

  for (const question of game.questions) {
    for (const dimension of game.dimensions) {
      const best = Math.max(
        0,
        ...question.options.map((option) => option.scores[dimension.id] ?? 0),
      )
      available.set(dimension.id, (available.get(dimension.id) ?? 0) + best)
    }

    const chosen = question.options.find((option) => option.id === answers[question.id])
    if (!chosen) continue
    for (const [id, points] of Object.entries(chosen.scores)) {
      earned.set(id, (earned.get(id) ?? 0) + points)
    }
  }

  const dimensions = game.dimensions.map((dimension) => {
    const max = available.get(dimension.id) ?? 0
    return {
      id: dimension.id,
      label: dimension.label,
      percent: max > 0 ? Math.round(((earned.get(dimension.id) ?? 0) / max) * 100) : 0,
    }
  })

  const totalEarned = [...earned.values()].reduce((sum, value) => sum + value, 0)
  const totalAvailable = [...available.values()].reduce((sum, value) => sum + value, 0)
  const total = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0

  const ranked = [...dimensions].sort((a, b) => b.percent - a.percent)

  return {
    dimensions,
    total,
    level: levelFor(game, total),
    strongest: ranked[0],
    weakest: ranked[ranked.length - 1],
  }
}

/** The highest band the score reaches. Bands are validated to start at zero. */
export function levelFor(game: ProfileGame, total: number): ProfileGame["levels"][number] {
  const reached = [...game.levels]
    .sort((a, b) => a.minScore - b.minScore)
    .filter((level) => total >= level.minScore)
  return reached[reached.length - 1] ?? game.levels[0]!
}
