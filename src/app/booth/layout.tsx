import type { Metadata } from "next"
import type { ReactNode } from "react"

/**
 * The capture tablet is reached by a secret link, so it must never be indexed,
 * cached by a proxy, or previewed by a chat client that unfurls a pasted URL.
 */
export const metadata: Metadata = {
  title: "ثبت لید غرفه",
  robots: { index: false, follow: false, nocache: true },
}

/**
 * The kiosk locks `body` to a non-scrolling viewport for the canvas. This is an
 * ordinary document on a tablet that has to scroll, so it lays its own scrolling
 * surface over that one rather than unpicking the global rule.
 */
export default function BoothLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-[var(--kiosk-bg)] text-[var(--kiosk-text)]">
      {children}
    </div>
  )
}
