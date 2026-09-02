"use client"

import { content } from "@/content/load"
import type { WorldPalette } from "@/content/schema/worlds"

/**
 * Publishes the palette from `brand.json` as CSS custom properties, plus one
 * override block per world from `worlds.json`, so a rebrand — and a world's whole
 * visual identity — is a content edit rather than a stylesheet change.
 *
 * The worlds are selected by `data-world`, which two things carry: every scene
 * that declares `meta.world`, and the document element, written by
 * `WorldSurface` from the active scene. Custom properties inherit, so the scene
 * attribute dresses that scene's own subtree — which is what lets the overview
 * map show three worlds side by side — while the document attribute dresses the
 * board and the surround the stage sits on.
 *
 * The world blocks are emitted after the `:root` block deliberately: they match
 * at the same specificity, so source order is what makes a world win.
 */
export function KioskTheme() {
  const worldBlocks = content.worlds.worlds
    .map((world) => `[data-world="${world.id}"]{${declarations(world.palette)}}`)
    .join("")

  const css = `:root{${declarations(content.brand.colors)}}${worldBlocks}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

function declarations(palette: WorldPalette): string {
  return [
    `--kiosk-bg:${palette.background}`,
    `--kiosk-surface:${palette.surface}`,
    `--kiosk-card:${palette.card}`,
    `--kiosk-border:${palette.border}`,
    `--kiosk-accent:${palette.accent}`,
    `--kiosk-accent-soft:${palette.accentSoft}`,
    `--kiosk-on-accent:${palette.onAccent}`,
    `--kiosk-text:${palette.text}`,
    `--kiosk-muted:${palette.textMuted}`,
    `--kiosk-card-text:${palette.cardText}`,
    `--kiosk-card-muted:${palette.cardMuted}`,
    `--kiosk-money:${palette.money}`,
    `--kiosk-positive:${palette.positive}`,
    `--kiosk-joy:${palette.joy}`,
  ].join(";")
}
