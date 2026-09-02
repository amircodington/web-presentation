"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { ShopGame as ShopGameContent } from "@/content/schema/activities"
import { basketTotal, budgetLeft, canAfford, evaluateBasket } from "@/lib/games/shop"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Mascot } from "@/components/ui/Mascot"

interface Props {
  game: ShopGameContent
  onFinish: () => void
  finishLabel: string
}

/**
 * A shop with a fixed purse.
 *
 * The purse is the game. It counts down in front of the child as they shop, and
 * when something no longer fits the shop does not refuse with an error — it says
 * "count again" and the product simply stays on the shelf. Brief §20 is explicit
 * about that: a hard error at a booth reads as a broken screen and the child
 * stops touching it, which is the opposite of what the lesson needs.
 */
export function ShopGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [basket, setBasket] = useState<Record<string, number>>({})
  const [checkedOut, setCheckedOut] = useState(false)
  const [nudge, setNudge] = useState<string>()

  const left = budgetLeft(game, basket)
  const spent = basketTotal(game, basket)
  const items = Object.values(basket).reduce((sum, count) => sum + count, 0)

  const add = (productId: string) => {
    if (!canAfford(game, basket, productId)) {
      play("warn")
      setNudge(game.shortOfMoney)
      setTimeout(() => setNudge(undefined), 2600)
      return
    }
    play("place")
    setBasket((all) => ({ ...all, [productId]: (all[productId] ?? 0) + 1 }))
  }

  const remove = (productId: string) => {
    setBasket((all) => {
      const next = (all[productId] ?? 0) - 1
      if (next > 0) return { ...all, [productId]: next }
      const rest = { ...all }
      delete rest[productId]
      return rest
    })
  }

  if (checkedOut) {
    const rules = evaluateBasket(game, basket)
    return (
      <div className="flex h-full flex-col justify-center gap-6">
        <div className="flex items-center justify-center gap-8">
          <Mascot name="bag" mood="wow" size={130} />
          <p className="display text-[52px]">
            {toPersianDigits(items)} چیز خریدی و {toPersianDigits(left)} {game.currency} برایت ماند
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => {
            const copy = game.feedback[rule]
            if (!copy) return null
            return (
              <motion.div
                key={rule}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mat rounded-[28px] px-8 py-5"
              >
                <h4 className="text-[30px] font-bold text-[var(--kiosk-accent)]">{copy.title}</h4>
                <p className="text-[24px] leading-relaxed text-[var(--kiosk-card-muted)]">
                  {copy.body}
                </p>
              </motion.div>
            )
          })}
        </div>
        <div className="flex justify-center gap-5">
          <Button onClick={onFinish}>{finishLabel}</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setBasket({})
              setCheckedOut(false)
            }}
          >
            دوباره
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-8">
        <p className="text-[30px] font-bold">{game.prompt}</p>
        <Wallet left={left} spent={spent} currency={game.currency} budget={game.budget} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {game.products.map((product) => {
          const count = basket[product.id] ?? 0
          const affordable = canAfford(game, basket, product.id)
          return (
            <div key={product.id} className="relative" data-sound="own">
              <motion.button
                type="button"
                onClick={() => add(product.id)}
                aria-label={`خرید ${product.label} به قیمت ${product.price} ${game.currency}`}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: count > 0 ? "var(--kiosk-accent-soft)" : "var(--kiosk-card)",
                  boxShadow: "7px 7px 0 0 var(--kiosk-border)",
                  // Not disabled: it must still respond, and answer with "count
                  // again" rather than going dead under a child's finger.
                  opacity: affordable ? 1 : 0.55,
                }}
                className="flex min-h-[210px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[30px] border-[4px] border-[var(--kiosk-border)] p-3 text-[var(--kiosk-card-text)]"
              >
                <Icon name={product.icon} size={72} />
                <span className="text-[26px] font-bold">{product.label}</span>
                <span className="pill-on-mat rounded-full px-4 py-1 text-[22px] font-bold">
                  {toPersianDigits(product.price)} {game.currency}
                </span>
              </motion.button>

              {count > 0 ? (
                <>
                  <span className="absolute -top-3 -end-3 grid h-14 w-14 place-items-center rounded-full border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-positive)] text-[28px] font-black text-[var(--kiosk-border)]">
                    {toPersianDigits(count)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`برداشتن یک ${product.label} از سبد`}
                    className="absolute start-3 top-3 grid h-12 w-12 cursor-pointer place-items-center rounded-full border-[3px] border-[var(--kiosk-border)] bg-[var(--kiosk-money)] text-[30px] leading-none font-black text-[var(--kiosk-border)]"
                  >
                    −
                  </button>
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex min-h-[104px] items-center justify-center gap-5">
        <AnimatePresence mode="wait">
          {nudge ? (
            <motion.span
              key="nudge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mat rounded-full px-10 py-4 text-[30px] font-bold text-[var(--kiosk-accent)]"
            >
              {nudge}
            </motion.span>
          ) : items > 0 ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={() => {
                  play("purchase")
                  setCheckedOut(true)
                }}
              >
                حساب کنیم!
              </Button>
            </motion.div>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[28px] font-medium text-[var(--kiosk-muted)]"
            >
              روی هر چیزی که می‌خواهی بزن
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * The purse, as a bar that empties rather than as a number that decreases.
 *
 * A seven-year-old reads "getting shorter" long before they read a subtraction,
 * and the bar is what makes "the money is limited" a thing they watch happen.
 */
function Wallet({
  left,
  spent,
  budget,
  currency,
}: {
  left: number
  spent: number
  budget: number
  currency: string
}) {
  return (
    <div className="mat flex items-center gap-5 rounded-full px-7 py-3">
      <Mascot name="bag" mood={left === 0 ? "dizzy" : "happy"} size={54} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[26px] font-bold">
          {toPersianDigits(left)} {currency} داری
        </span>
        <span className="h-3 w-[260px] overflow-hidden rounded-full bg-[var(--kiosk-accent-soft)]">
          <motion.span
            className="block h-full rounded-full bg-[var(--kiosk-money)]"
            animate={{ width: `${Math.max(0, 100 - (spent / budget) * 100)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        </span>
      </div>
    </div>
  )
}
