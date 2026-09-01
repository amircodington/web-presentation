"use client"

import { content } from "@/content/load"
import { AllocationGame } from "@/components/games/AllocationGame"
import { JudgementGame } from "@/components/games/JudgementGame"
import { MarketGame } from "@/components/games/MarketGame"
import { Mascot } from "@/components/ui/Mascot"
import { castFor } from "@/lib/games/cast"
import { toPersianDigits } from "@/lib/format"
import type { SceneComponentProps } from "@/engine"

/**
 * Hosts one playable booth activity, chosen by `props.activityId` in `scenes.json`.
 *
 * The game only mounts while the scene is active, so leaving the scene discards the
 * board and the next visitor never walks up to someone else's half-finished game.
 * That is the guarantee the idle reset gives the quiz, applied locally — and it
 * keeps inactive scenes cheap, which the lifecycle contract requires.
 */
export function GameScene({ state, camera, props }: SceneComponentProps) {
  const activityId = String(props.activityId ?? "")
  const activity = content.activities.activities.find((item) => item.id === activityId)

  if (!activity?.game) return null

  const game = activity.game
  const finish = () => camera.goTo("quiz-intro", "dive")

  return (
    <div className="scene-surface flex h-full w-full flex-col gap-4 rounded-[48px] px-16 pt-12 pb-60">
      <header className="flex items-start justify-between gap-8">
        <div className="flex items-center gap-6">
          <Mascot name={castFor(activity.icon)} mood="happy" size={72} />
          <div className="flex flex-col">
            <h2 className="display text-[40px]">{activity.title}</h2>
            <p className="text-[25px] text-[var(--kiosk-muted)]">{activity.hook}</p>
          </div>
        </div>
        <span className="pill shrink-0 rounded-full px-6 py-2 text-[23px]">
          {toPersianDigits(activity.durationMin)} دقیقه
        </span>
      </header>

      <div className="min-h-0 flex-1">
        {state !== "active" ? (
          <GamePreview learning={activity.learning} />
        ) : game.kind === "allocation" ? (
          <AllocationGame game={game} onFinish={finish} />
        ) : game.kind === "market" ? (
          <MarketGame game={game} onFinish={finish} />
        ) : (
          <JudgementGame game={game} onFinish={finish} />
        )}
      </div>
    </div>
  )
}

/** What an inactive game scene shows: the lesson, not a frozen board. */
function GamePreview({ learning }: { learning: readonly string[] }) {
  return (
    <div className="flex h-full flex-wrap content-center gap-4">
      {learning.map((item) => (
        <span key={item} className="pill rounded-full px-7 py-4 text-[27px]">
          {item}
        </span>
      ))}
    </div>
  )
}
