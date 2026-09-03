"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { content } from "@/content/load"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/content/schema/common"
import type { SceneComponentProps } from "@/engine"

const CHANNELS: readonly { key: string; label: string; icon: IconName }[] = [
  { key: "test-result", label: "نتیجه تست و مسیر پیشنهادی", icon: "gauge" },
  { key: "general", label: "سایت و ثبت‌نام", icon: "globe" },
  { key: "telegram", label: "تلگرام باشگاه ثروت", icon: "telegram" },
  { key: "bale", label: "بله باشگاه ثروت", icon: "chat" },
  { key: "school", label: "همکاری با مدرسه", icon: "school" },
  { key: "organization", label: "همکاری سازمانی", icon: "organization" },
]

/**
 * The conversion point. QR codes are rendered on-device rather than fetched, so
 * the whole path works with the network unplugged — which is the state the venue
 * will actually be in at some point during the festival.
 */
export function ConnectScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const [selected, setSelected] = useState<string>("test-result")

  return (
    /*
      `items-stretch`, not `items-center`. A centred row whose content is taller
      than its box overflows at *both* ends, and this one did — the eyebrow was
      sliced off the top edge of the stage.
    */
    <div className="scene-surface flex h-full w-full items-stretch gap-14 rounded-[48px] px-20 pt-10 pb-[var(--kiosk-chrome-clearance,240px)]">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
        <div className="flex shrink-0 flex-col gap-2">
          <p className="text-[25px] font-medium text-[var(--kiosk-money)]">قدم بعدی</p>
          <h2 className="display text-[50px]">با موبایلت کد را اسکن کن</h2>
          <p className="text-[24px] text-[var(--kiosk-muted)]">
            {content.contact.website} · {content.contact.phone}
          </p>
        </div>

        {/*
          Two columns. Six channels stacked, each at the 88px touch floor AGENTS.md
          §8 sets, is taller than the frame leaves room for — the last of them ended
          up under the button below it.
        */}
        <div className="grid min-h-0 grid-cols-2 gap-2.5">
          {CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={() => setSelected(channel.key)}
              /*
                An unselected channel is a card, so it takes the card's ink —
                AGENTS.md §8. It used to mix its own grey fill and keep the board's
                text colour, which is invisible in the dark worlds.
              */
              className={`flex min-h-[88px] shrink-0 cursor-pointer items-center gap-5 rounded-2xl border-[3px] border-[var(--kiosk-border)] px-7 text-start text-[26px] font-semibold transition-colors duration-[var(--duration-instant)] ${
                selected === channel.key
                  ? "bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)]"
                  : "bg-[var(--kiosk-card)] text-[var(--kiosk-card-text)]"
              }`}
            >
              <Icon name={channel.icon} size={32} />
              {channel.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0">
          <Button variant="ghost" onClick={() => camera.home()}>
            بازگشت به ابتدا
          </Button>
        </div>
      </div>

      <motion.div
        key={selected}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.7, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mat flex shrink-0 items-center self-center rounded-[40px] p-8"
      >
        <QrCode value={content.qr[selected] ?? content.qr.general!} />
      </motion.div>
    </div>
  )
}

function QrCode({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string>()

  useEffect(() => {
    let cancelled = false
    void QRCode.toDataURL(value, { width: 460, margin: 0, errorCorrectionLevel: "M" }).then(
      (url) => {
        if (!cancelled) setDataUrl(url)
      },
    )
    return () => {
      cancelled = true
    }
  }, [value])

  if (!dataUrl) return <div className="h-[460px] w-[460px]" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="کد QR برای ادامه روی موبایل" width={460} height={460} />
}
