import type { Metadata, Viewport } from "next"
import { Vazirmatn } from "next/font/google"
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

export const metadata: Metadata = {
  title: "باشگاه ثروت",
  description: "سواد مالی، از نوجوانی تا تصمیم‌های بزرگ",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070b14",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-[family-name:var(--font-kiosk)] antialiased">{children}</body>
    </html>
  )
}
