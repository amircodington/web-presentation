import { content } from "@/content/load"

interface LogoProps {
  /** `mark` is the emblem alone; `full` adds the Persian wordmark beneath it. */
  variant?: "mark" | "full"
  height?: number
  className?: string
}

/**
 * The Wealth Club emblem.
 *
 * Served from `public/media` with a transparent ground so it sits on the dark
 * board without a white plate around it, and never fetched from a remote host —
 * the booth machine has to render this with the network unplugged.
 */
export function Logo({ variant = "mark", height = 96, className = "" }: LogoProps) {
  const src = variant === "full" ? content.brand.logo : content.brand.logoMark
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={content.brand.nameFa}
      style={{ height, width: "auto" }}
      className={className}
    />
  )
}
