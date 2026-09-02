"use client"

import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import type { StallGame as StallGameContent } from "@/content/schema/activities"
import { runStall, stallLesson } from "@/lib/games/stall"
import { toPersianDigits } from "@/lib/format"
import { useSound } from "@/components/kiosk/AudioProvider"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Mascot } from "@/components/ui/Mascot"

interface Props {
  game: StallGameContent
  onFinish: () => void
  finishLabel: string
}

/** How long each customer waits before the next one walks up. */
const QUEUE_STEP_MS = 900

/**
 * Run a stall: pick something to sell, pick a price, meet the queue.
 *
 * There is no right price and the game never says there is. Charge little and
 * everyone buys for almost nothing; charge a lot and one person buys. A child
 * plays twice and discovers the trade themselves, which is the only way brief
 * §21's list — product, price, customer, income — becomes something felt rather
 * than recited.
 */
export function StallGame({ game, onFinish, finishLabel }: Props) {
  const { play } = useSound()
  const [productId, setProductId] = useState<string>()
  const [price, setPrice] = useState<number>()
  const [served, setServed] = useState(0)

  const product = game.products.find((candidate) => candidate.id === productId)
  const open = product !== undefined && price !== undefined
  const result = open ? runStall(game, product.id, price) : undefined
  const finished = result !== undefined && served >= result.sales.length

  const openStall = (chosen: number) => {
    play("purchase")
    setPrice(chosen)
    setServed(0)
    // The queue arrives one at a time, so each reaction is its own moment
    // rather than a table of results appearing at once.
    const walkUp = (index: number) => {
      if (!product) return
      setTimeout(() => {
        const sale = runStall(game, product.id, chosen).sales[index]
        if (!sale) return
        play(sale.bought ? "good" : "warn")
        setServed(index + 1)
        walkUp(index + 1)
      }, QUEUE_STEP_MS)
    }
    walkUp(0)
  }

  const restart = () => {
    setProductId(undefined)
    setPrice(undefined)
    setServed(0)
  }

  if (!product) {
    return (
      <div className="flex h-full flex-col justify-center gap-9">
        <p className="text-center text-[36px] font-bold">{game.prompt}</p>
        <div className="grid grid-cols-3 gap-6">
          {game.products.map((candidate) => (
            <motion.button
              key={candidate.id}
              type="button"
              onClick={() => setProductId(candidate.id)}
              whileTap={{ x: 8, y: 8, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
              className="mat flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[36px] px-6"
            >
              <Icon name={candidate.icon} size={96} />
              <b className="display text-[40px]">{candidate.label}</b>
              <span className="pill-on-mat rounded-full px-5 py-1.5 text-[22px]">
                ساختش {toPersianDigits(candidate.cost)} {game.currency} خرج دارد
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (price === undefined) {
    return (
      <div className="flex h-full flex-col justify-center gap-9">
        <div className="flex items-center justify-center gap-6">
          <Icon name={product.icon} size={80} />
          <p className="display text-[48px]">هر {product.label} را چند می‌فروشی؟</p>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {product.prices.map((candidate) => (
            <motion.button
              key={candidate}
              type="button"
              onClick={() => openStall(candidate)}
              whileTap={{ x: 8, y: 8, boxShadow: "0px 0px 0 0 var(--kiosk-border)" }}
              data-sound="own"
              className="mat flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[32px]"
            >
              <b className="display text-[58px] text-[var(--kiosk-money)]">
                {toPersianDigits(candidate)}
              </b>
              <span className="text-[24px] text-[var(--kiosk-card-muted)]">{game.currency}</span>
            </motion.button>
          ))}
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" onClick={restart}>
            یه چیز دیگه بفروشم
          </Button>
        </div>
      </div>
    )
  }

  const lesson = game.feedback[stallLesson(game, product.id, price)]

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <Icon name={product.icon} size={56} />
          <p className="text-[32px] font-bold">
            غرفه {product.label} — هر کدام {toPersianDigits(price)} {game.currency}
          </p>
        </div>
        <span className="pill flex items-center gap-4 rounded-full px-7 py-2.5 text-[26px] font-bold">
          <span>فروختی {toPersianDigits(result?.sales.slice(0, served).filter((s) => s.bought).length ?? 0)}</span>
          <span className="text-[var(--kiosk-money)]">
            درآمد {toPersianDigits((result?.sales.slice(0, served).filter((s) => s.bought).length ?? 0) * price)}
          </span>
        </span>
      </div>

      <div className="grid flex-1 grid-cols-4 content-center gap-5">
        {result?.sales.map((sale, index) => {
          const arrived = index < served
          return (
            <motion.div
              key={sale.name}
              initial={{ opacity: 0, y: 40 }}
              animate={arrived ? { opacity: 1, y: 0 } : { opacity: 0.25, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="mat flex min-h-[230px] flex-col items-center justify-center gap-3 rounded-[32px] px-4 text-center"
            >
              <Mascot
                name="coin"
                mood={!arrived ? "idle" : sale.bought ? "happy" : "worried"}
                size={74}
              />
              <b className="text-[28px]">{sale.name}</b>
              {arrived ? (
                <span
                  className="text-[24px] leading-snug font-semibold"
                  style={{
                    color: sale.bought ? "var(--kiosk-positive)" : "var(--kiosk-accent)",
                  }}
                >
                  {sale.bought
                    ? sale.bargain
                      ? game.reactions.bargain
                      : game.reactions.buys
                    : game.reactions.tooExpensive}
                </span>
              ) : null}
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {finished && lesson ? (
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="mat flex-1 rounded-[28px] px-8 py-5">
              <h4 className="text-[30px] font-bold text-[var(--kiosk-accent)]">{lesson.title}</h4>
              <p className="text-[24px] leading-relaxed text-[var(--kiosk-card-muted)]">
                {lesson.body}
              </p>
            </div>
            <Button onClick={onFinish}>{finishLabel}</Button>
            <Button variant="ghost" onClick={restart}>
              دوباره
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
