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
    <div className="scene-surface flex h-full w-full items-center gap-14 rounded-[48px] px-20 pt-12 pb-[var(--kiosk-chrome-clearance,240px)]">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-[26px] font-medium text-[var(--kiosk-money)]">قدم بعدی</p>
          <h2 className="display text-[56px]">با موبایلت کد را اسکن کن</h2>
          <p className="text-[25px] text-[var(--kiosk-muted)]">
            {content.contact.website} · {content.contact.phone}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={() => setSelected(channel.key)}
              className={`flex min-h-[88px] cursor-pointer items-center gap-5 rounded-2xl border-2 px-7 text-start text-[28px] font-semibold transition-colors duration-[var(--duration-instant)] ${
                selected === channel.key
                  ? "border-transparent bg-[var(--kiosk-accent)] text-[var(--kiosk-on-accent)]"
                  : "border-[var(--kiosk-border)] bg-[color-mix(in_oklab,var(--kiosk-surface)_75%,black)] text-[var(--kiosk-text)]"
              }`}
            >
              <Icon name={channel.icon} size={36} />
              {channel.label}
            </button>
          ))}
        </div>

        <Button variant="ghost" onClick={() => camera.home()}>
          بازگشت به ابتدا
        </Button>
      </div>

      <motion.div
        key={selected}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.7, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mat rounded-[40px] p-10"
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
