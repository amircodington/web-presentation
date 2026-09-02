"use client"

import { useState } from "react"
import { content } from "@/content/load"
import { useSession } from "@/store/session"
import { AllocationGame } from "@/components/games/AllocationGame"
import { BudgetGame } from "@/components/games/BudgetGame"
import { InstalmentGame } from "@/components/games/InstalmentGame"
import { JudgementGame } from "@/components/games/JudgementGame"
import { MarketGame } from "@/components/games/MarketGame"
import { ProfileGame } from "@/components/games/ProfileGame"
import { ShopGame } from "@/components/games/ShopGame"
import { SortGame } from "@/components/games/SortGame"
import { StallGame } from "@/components/games/StallGame"
import { Celebration } from "@/components/kiosk/Celebration"
import { Mascot } from "@/components/ui/Mascot"
import { castFor } from "@/lib/games/cast"
import { toPersianDigits } from "@/lib/format"
import type { Activity } from "@/content/schema/activities"
import type { SceneComponentProps } from "@/engine"

/** Brief §12: the way out of a game is an invitation, never a dead end. */
const FINISH_LABEL = "یه بازی دیگه هم بزن! ←"

/**
 * Hosts one playable booth activity, chosen by `props.activityId` in `scenes.json`.
 *
 * The game only mounts while the scene is active, so leaving the scene discards the
 * board and the next visitor never walks up to someone else's half-finished game.
 * That is the guarantee the idle reset gives the quiz, applied locally — and it
 * keeps inactive scenes cheap, which the lifecycle contract requires.
 *
 * An activity that carries a badge gets its celebration here rather than inside
 * each game, so all six mechanics end the same way and none of them has to know
 * what a badge is.
 */
export function GameScene({ state, camera, props }: SceneComponentProps) {
  const activityId = String(props.activityId ?? "")
  const activity = content.activities.activities.find((item) => item.id === activityId)
  const complete = useSession((store) => store.complete)
  const [celebrating, setCelebrating] = useState(false)

  if (!activity?.game) return null

  const game = activity.game

  /**
   * Finishing returns to the world the game belongs to, so the visitor lands back
   * on the path they came from with this stop marked done — brief §12's "یه بازی
   * دیگه هم بزن!". Every game's `back` edge is its world home, so the camera edge
   * is the single source of truth rather than a scene id repeated in code.
   */
  const finish = () => {
    complete(activityId)
    if (activity.badge) {
      setCelebrating(true)
      return
    }
    camera.back()
  }

  return (
    <div className="scene-surface relative flex h-full w-full flex-col gap-4 rounded-[48px] px-16 pt-12 pb-60">
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
          <AllocationGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "market" ? (
          <MarketGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "judgement" ? (
          <JudgementGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "sort" ? (
          <SortGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "shop" ? (
          <ShopGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "profile" ? (
          <ProfileGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "budget" ? (
          <BudgetGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : game.kind === "instalment" ? (
          <InstalmentGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        ) : (
          <StallGame game={game} onFinish={finish} finishLabel={FINISH_LABEL} />
        )}
      </div>

      <Celebration
        badge={celebrating ? activity.badge : undefined}
        onDone={() => {
          setCelebrating(false)
          camera.back()
        }}
      />
    </div>
  )
}

/** What an inactive game scene shows: the lesson, not a frozen board. */
function GamePreview({ learning }: { learning: Activity["learning"] }) {
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
