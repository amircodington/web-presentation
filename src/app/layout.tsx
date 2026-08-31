import type { Metadata, Viewport } from "next"
import { Lalezar, Vazirmatn } from "next/font/google"
import "./globals.css"

/**
 * Self-hosted by Next at build time, so no font request leaves the machine —
 * a Google Fonts fetch is a blank screen when the venue network drops.
 */
const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
  variable: "--font-kiosk",
})

/**
 * The display face, for hero lines and big numbers only.
 *
 * Lalezar is a poster face: one weight, heavy, and unmistakably Persian rather
 * than a Latin family with Persian glyphs bolted on. That is right for the three
 * or four lines a passer-by reads at ten metres and wrong for everything else, so
 * it is reached through the `display` utility rather than set on the body.
 */
const lalezar = Lalezar({
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
  variable: "--font-kiosk-display",
})

export const metadata: Metadata = {
  title: "باشگاه ثروت",
  description: "بازی کن، خودت را محک بزن، مسیرت را ببین",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07301D",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body className="font-[family-name:var(--font-kiosk)] antialiased">{children}</body>
    </html>
  )
}
