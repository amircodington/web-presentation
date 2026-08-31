# Source assets

Originals as supplied by the Wealth Club team. Nothing here is served by the app —
these are the masters that `public/media/` is derived from, kept so a future crop,
resize or re-export starts from full resolution rather than from a shipped file.

## What ships from what

| Original | Shipped as | Treatment |
|---|---|---|
| `logo.PNG` | `public/media/logo-mark.png` | Emblem cropped, white keyed out, 400px wide |
| `logo.PNG` | `public/media/logo-full.png` | Emblem + wordmark, white keyed out, 440px wide |
| `Business-school-poster.jpg` | `public/media/poster-plus18.jpg` | 800px wide — the +18 course poster, despite the filename |
| `photo_1405-06-09 4.16.24 PM.jpeg` | `public/media/workshop-board.jpg` | 1400px — teenagers around the board. The attract loop's ground and the student card |
| `photo_1405-06-09 4.16.55 PM.jpeg` | `public/media/workshop-theatre.jpg` | 1200px — auditorium session. School card, Business School |
| `photo_1405-06-09 4.17.28 PM.jpeg` | `public/media/workshop-hands.jpg` | 1200px — hands, chips and banknotes. Recent-konkur card |
| `photo_1405-06-09 4.17.37 PM.jpeg` | `public/media/venue-hall.jpg` | 1200px — Bagh-e Ketab hall. Organisation card |
| `photo_1405-06-09 4.17.43 PM.jpeg` | `public/media/venue-welcome.jpg` | 1200px — venue entrance signage. Unused so far |
| `photo_1405-06-09 4.17.47 PM.jpeg` | `public/media/workshop-steps.jpg` | 1200px — audience on the steps. Parent card |

Re-exports were made with `ffmpeg`; the two logo variants use a `colorkey` filter to
drop the white ground, because the emblem sits directly on the dark board with no plate
behind it.

## Briefs

`FINAL-CHANGE-REQUEST-BAGH-MADRESEH.md` is the Bagh Madreseh change request. It is the
source for `content/event.json` — hours, running order, audience priority, product order
and the attract copy all trace back to it.

The authoritative product source remains
[`docs/wealth-club-kiosk-handoff-pack/`](../wealth-club-kiosk-handoff-pack/); this file
records the event-specific amendments on top of it.
