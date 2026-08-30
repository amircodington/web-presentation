"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { content } from "@/content/load"
import { Button } from "@/components/ui/Button"
import type { SceneComponentProps } from "@/engine"

const CHANNELS = [
  { key: "general", label: "سایت و ثبت‌نام", icon: "🌐" },
  { key: "telegram", label: "تلگرام باشگاه ثروت", icon: "✈️" },
  { key: "bale", label: "بله باشگاه ثروت", icon: "💬" },
  { key: "school", label: "همکاری با مدرسه", icon: "🏫" },
  { key: "organization", label: "همکاری سازمانی", icon: "🏢" },
] as const

/**
 * The conversion point. QR codes are rendered on-device rather than fetched, so
 * the whole path works with the network unplugged — which is the state the venue
 * will actually be in at some point during the festival.
 */
export function ConnectScene({ state, camera }: SceneComponentProps) {
  const isActive = state === "active"
  const [selected, setSelected] = useState<string>("general")

  return (
    <div className="scene-surface flex h-full w-full items-center gap-14 rounded-[48px] px-20 pt-12 pb-52">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-[28px] font-medium text-[var(--kiosk-accent)]">قدم بعدی</p>
          <h2 className="text-[58px] leading-[1.15] font-bold">با موبایلت کد را اسکن کن</h2>
          <p className="text-[27px] text-[var(--kiosk-muted)]">
            {content.contact.website} · {content.contact.phone}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CHANNELS.map((channel) => (
            <button
              key={channel.key}
              type="button"
              onClick={() => setSelected(channel.key)}
              className={`flex min-h-[78px] cursor-pointer items-center gap-5 rounded-2xl border-2 px-8 text-start text-[29px] font-semibold transition-colors duration-[var(--duration-instant)] ${
                selected === channel.key
                  ? "border-[var(--kiosk-accent)] bg-[var(--kiosk-accent)]/12 text-[var(--kiosk-accent)]"
                  : "card-surface"
              }`}
            >
              <span className="text-[40px]">{channel.icon}</span>
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
        className="rounded-[40px] bg-white p-10"
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
