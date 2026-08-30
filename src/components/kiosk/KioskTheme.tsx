"use client"

import { content } from "@/content/load"

/**
 * Publishes the palette from `brand.json` as CSS custom properties, so a rebrand
 * is a content edit rather than a stylesheet change.
 */
export function KioskTheme() {
  const { colors } = content.brand
  const css = `:root{
    --kiosk-bg:${colors.background};
    --kiosk-surface:${colors.surface};
    --kiosk-card:${colors.card};
    --kiosk-border:${colors.border};
    --kiosk-accent:${colors.accent};
    --kiosk-accent-soft:${colors.accentSoft};
    --kiosk-on-accent:${colors.onAccent};
    --kiosk-text:${colors.text};
    --kiosk-muted:${colors.textMuted};
  }`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
