import type { MediaRef } from "@/content/schema/common"

interface PhotoProps {
  media: MediaRef
  className?: string
  /** Darkens the image so text can sit on top of it and still clear contrast. */
  scrim?: boolean
}

/**
 * A photograph from a real Wealth Club session.
 *
 * `focalPoint` drives `object-position` rather than the image being centre-cropped:
 * these are wide room shots, and a centre crop of one puts the subject's shoulder
 * in frame and their face outside it.
 *
 * Served straight from `public/media` rather than through the image optimiser — the
 * booth machine runs offline and the sizes are fixed by the design grid anyway.
 */
export function Photo({ media, className = "", scrim = false }: PhotoProps) {
  const [x, y] = media.focalPoint
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.src}
        alt={media.alt}
        className="h-full w-full object-cover"
        style={{ objectPosition: `${x * 100}% ${y * 100}%` }}
      />
      {scrim ? (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--kiosk-bg) 10%, transparent) 0%, color-mix(in oklab, var(--kiosk-bg) 88%, transparent) 78%, var(--kiosk-bg) 100%)",
          }}
        />
      ) : null}
    </span>
  )
}
