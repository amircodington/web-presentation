# 04 — Content Model

The rule from `AGENTS.md` §3: **no copy, price, date, phone number, or URL is ever written in a
component.** All of it lives in `content/` as plain JSON, and reaches the app through one
validated loader.

## Why Zod, and why it runs twice

The failure this design exists to prevent is specific and likely: someone edits `courses.json`
the night before the festival, mistypes a key, and a two-metre screen displays `undefined` to
the public for eight hours.

So every content file has a Zod schema, and it is enforced at two moments:

- **Build time**, in `scripts/validate-content.ts`, wired into `npm run build` and CI. A bad
  edit fails the build. This is the one that matters.
- **Runtime**, in `content/load.ts` on first read. This catches a file swapped into a running
  container at the booth, and degrades to the last-known-good snapshot instead of crashing.

`load.ts` freezes what it returns. Content is immutable once loaded.

## Types

Derived from the shapes already specified in the handoff pack, tightened where `"TBD"` was
acceptable in a brief but is not acceptable in a build.

```ts
/** A course in the catalogue. Inactive courses are excluded from every view. */
export const CourseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().optional(),
  targetAge: z.string().optional(),
  duration: z.string().optional(),
  priceRegular: z.number().int().nonnegative().optional(),
  priceFestival: z.number().int().nonnegative().optional(),
  registrationUrl: z.string().url().optional(),
  media: MediaRefSchema.optional(),
  audiences: z.array(AudienceIdSchema).default([]),
  active: z.boolean(),
})
```

```ts
/** A dated workshop session. `capacity` drives the "almost full" badge. */
export const WorkshopSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.string().optional(),
  teacher: z.string().optional(),
  targetAge: z.string().optional(),
  priceRegular: z.number().int().nonnegative().optional(),
  priceFestival: z.number().int().nonnegative().optional(),
  capacity: z.number().int().positive().optional(),
  registrationUrl: z.string().url().optional(),
  active: z.boolean(),
})
```

```ts
/** Points at a video or image in public/media, with the poster used before playback. */
export const MediaRefSchema = z.object({
  kind: z.enum(["image", "video"]),
  src: z.string().startsWith("/media/"),
  poster: z.string().startsWith("/media/").optional(),
  alt: z.string().min(1),
  focalPoint: z.tuple([z.number(), z.number()]).default([0.5, 0.5]),
})
```

Three deliberate choices in there. Prices are **integers in Toman**, never strings and never
pre-formatted — formatting is a rendering concern and Persian digit shaping belongs in one
place. `alt` is **required** on media, because the same string is what a screen reader and a
failed-image fallback both need. `focalPoint` exists because Ken Burns pans on a portrait crop
look wrong without it.

## Dates

Content dates are stored as **ISO Gregorian** (`2026-09-14`) and rendered as **Jalali**. Storing
Jalali strings would make sorting and "is this workshop still upcoming" comparisons a mess.
Conversion happens once, in a formatter in `lib/`, never inline in a component.

## The offer overlay

`offers.json` overrides catalogue prices during the festival rather than duplicating the
catalogue. Turning the festival pricing on or off is one boolean in `festival.json`, and
crucially, it turns off cleanly — no half-priced card left on screen.

```ts
/** Resolves the price to display for a product, honouring the festival offer toggle. */
export function priceFor(productId: string): { regular: number; festival?: number }
```

## Quiz and recommendation

`quiz.json` holds questions and per-option scores; `results.json` maps score bands to a result
type and an ordered list of recommended product ids. Both follow
[`04-QUIZ-LOGIC.md`](../wealth-club-kiosk-handoff-pack/04-QUIZ-LOGIC.md) in the handoff pack.

The scoring and recommendation functions in `lib/` are **pure** — answers in, ids out, no
store access, no side effects. That is what makes the highest-risk logic in the product
exhaustively testable without a browser.

Schema validation enforces the invariants that would otherwise fail silently in front of a
visitor: every `recommendedProducts` id exists in `courses.json` or `workshops.json`, the
result bands cover the full reachable score range with no gaps and no overlaps, and every
question has at least two options.

## Playable booth activities

`activities.json` carries the live mini-workshops from the activations brief. Each
may include a `game` object, and the kiosk plays a short version on screen while a
visitor waits for the next live run.

Three mechanics cover all four activities, discriminated on `game.kind`:

| Kind | Activity | Mechanic |
|---|---|---|
| `allocation` | چالش ۱۰۰ میلیون · سبدت رو بچین | Split a fixed pot of tokens between options |
| `market` | راز نوسان قیمت | Predict which way each headline moves the price |
| `judgement` | فرصته یا کلاهبرداری؟ | Judge each offer reasonable or suspicious |

The split is deliberate: **rules live in code, wording lives in content.**
`lib/games/allocation.ts` decides which lessons an allocation demonstrates and
returns rule ids; `activities.json` holds the Persian copy for each id. So the
teaching text can be rewritten without touching logic, and the logic is testable
without rendering anything. A test asserts that every rule the evaluator can emit
has copy in every allocation game — a rule without copy would show a visitor an
empty result panel at the exact moment they are most engaged.

Options carry `risk` and `growth` rather than being hardcoded by id, so adding a
new asset to a game is a content edit.

## QR destinations

`qr.json` maps a purpose (`general`, `plus18`, `school`, `test_result`, …) to a URL. Codes are
rendered on-device at display time. Nothing is fetched, so nothing breaks offline.

Any URL carrying a UTM or campaign parameter belongs here in full — never assembled in a
component, or the analytics team will get a mix of tagged and untagged traffic and no way to
tell which screens produced it.

## Adding a content field

1. Add it to the JSON file.
2. Add it to the Zod schema.
3. Add a fixture case to the schema test.
4. Use it, via `load.ts`.
5. If it changes what the client must supply, update
   [`03-CONTENT-DATA-INPUTS.md`](../wealth-club-kiosk-handoff-pack/03-CONTENT-DATA-INPUTS.md).

Steps 2 and 5 are the ones that get skipped. Neither is optional.
