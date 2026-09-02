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

`booth.json` carries every label and option on the staff capture tablet: the audience types, the
product list, the follow-up statuses and the validation messages. It is content rather than code
for the same reason the rest is — the product names and the follow-up vocabulary change between
festivals, and neither should need a rebuild by a developer who is not at the stand.

An audience option carries `needsOrganization`, which is the one rule the shape depends on: a
school lead without a school name is not a lead anybody can follow up, while a parent has no
organisation to give.

`activities.json` carries the live mini-workshops from the activations brief. Each
may include a `game` object, and the kiosk plays a short version on screen while a
visitor waits for the next live run.

Six mechanics, discriminated on `game.kind`:

| Kind | Activity | Mechanic |
|---|---|---|
| `allocation` | چالش ۱۰۰ میلیون · سبدت رو بچین · قلک من | Split a fixed pot of tokens between options |
| `market` | راز نوسان قیمت | Predict which way each headline moves the price |
| `judgement` | فرصته یا کلاهبرداری؟ | Judge each offer reasonable or suspicious |
| `sort` | نیاز یا خواسته؟ | Drag each object into one of two bins |
| `shop` | فروشگاه کوچک | Spend a fixed purse, watching it empty |
| `stall` | کسب‌وکار کوچولوی من | Pick a product, pick a price, meet the queue |
| `profile` | چالش هوش مالی · پروفایل بزرگسال · خبر داغ | Scenario questions scoring across several dimensions |
| `budget` | قدرت خریدت چقدر مقاومه؟ | Rebalance a household budget under a cost shock |
| `instalment` | قسط واقعاً ارزون‌تره؟ | Guess the total cost, then watch the payments assemble |

Two rules the kids' mechanics exist to teach, and which the code encodes rather than the copy:

- **`sort` has a third verdict, `depends`, and it is never wrong.** Brief §18's lesson is that a
  money decision is not always yes or no, and a game that marks a defensible answer incorrect
  teaches the opposite of that.
- **`shop` never shows an error.** Running out of money is answered with "count again" and the
  product stays on the shelf. A hard error at a booth reads as a broken screen and the child
  stops touching it (§20). The product button stays live and merely dims — a control that goes
  dead under a finger is the same failure in a quieter costume.
- **`stall` has no right price.** Charge little and everyone buys for almost nothing; charge a
  lot and one person buys. Playing twice is what teaches the trade (§21).

`profile` is the one mechanic shared across worlds, and the reason is in its shape: every option
scores across several **dimensions** rather than being right or wrong. A teenager sees a score
out of 100 and a level (§30–31); an adult sees the same run rendered as six bars (§42). "How many
did you get right" is the wrong question for either, and an option nobody can be caught out by is
what makes a visitor answer honestly.

Each dimension is scored against the best *that dimension* could have reached given the questions
actually asked — not against a fixed maximum. Otherwise a dimension only two questions touch is
permanently capped low and reads as a weakness the visitor never demonstrated, which is the
fastest way to make a profile untrustworthy to the person reading it about themselves.

`budget` applies its shock as a **multiplier on the essentials**, never as a printed figure, and
an essential's floor is shocked too — so the rise cannot be cut away. Brief §58: "essential costs
have risen" stays true past this festival, while a percentage on screen is stale within weeks.
The lines are adjusted with steppers rather than a range input: a native thumb is about sixteen
pixels across, which on glass at standing height is a coin toss, not a control.

`instalment` asks for the **guess before the reveal**, and that ordering is the experience. Shown
a total, a visitor reads a number; asked to guess and then shown the payments stacking past their
guess, they feel the gap — which is what §39 is teaching, since the plan is sold on the size of
the monthly figure and never on the size of the sum.

An `allocation` game may also carry a `horizon` question, asked after the split and before the
result (§27). It is what turns the game from "was my split correct" into "was my split consistent
with my own horizon" — the only question the kiosk is allowed to answer, since §73 bans
investment advice in every world and a game that grades an allocation is giving exactly that.

An activity may also carry a `badge`. Brief §22 makes the celebration mandatory in the kids'
world, and `GameScene` runs it for any activity that has one — so all six mechanics end the same
way and none of them has to know what a badge is. It is deliberately not a score: a child who
spent everything on ice cream gets exactly the same confetti.

The split is deliberate: **rules live in code, wording lives in content.**
`lib/games/allocation.ts` decides which lessons an allocation demonstrates and
returns rule ids; `activities.json` holds the Persian copy for each id. So the
teaching text can be rewritten without touching logic, and the logic is testable
without rendering anything. A test asserts that every rule the evaluator can emit
has copy in every allocation game — a rule without copy would show a visitor an
empty result panel at the exact moment they are most engaged.

Options carry `risk` and `growth` rather than being hardcoded by id, so adding a
new asset to a game is a content edit.

## The three worlds

`content/worlds.json` is the spine of the visitor journey. The first interactive decision is
which of three age worlds the visitor is in, and everything downstream — palette, motion,
experiences, product reveal — hangs off that one choice.

```ts
const WorldSchema = z.object({
  id: AudienceGroupSchema,          // "kids" | "teens" | "adults"
  display: z.string().min(1),       // what the gateway card says
  subtext: z.string().min(1),
  headline: z.string().min(1),      // the world home's own headline
  intro: z.string().min(1),
  audiences: z.array(AudienceIdSchema).min(1),
  palette: WorldPaletteSchema,      // every brand colour this world overrides
  experiences: z.array(WorldExperienceSchema).length(4),
  diagnostic: WorldExperienceSchema.optional(),
})
```

**A group is not an audience.** `AudienceId` segments the *catalogue* — it answers "which course
suits this person". `AudienceGroup` answers "which world does this person play in", and a world
owns its own colours, motion density and tone. One group maps to several audiences; the reverse
is never needed. Both live in `schema/common.ts`.

**`experiences` is always four, and `active` is a switch.** An experience whose scene is not
built yet, or which the team wants off for one event, is declared and switched off — the world
home renders what is on and never a dead card. Only active entries are cross-checked against
`scenes.json`; an inactive one names the scene it *will* use, which is a forward declaration
rather than a broken link. A world with nothing active fails the build.

**`reveal` is where a world's products are shown**, and the world home only offers it once
something has been played. Brief §46 puts the offer after a result, never before an experience —
and §23 is why it needed a field at all: the kids' classes were missing from the previous build
entirely, because the only place a product could appear was a catalogue aimed at teenagers.

**`qualifier` is one question that re-files the visitor into a narrower catalogue audience.**
Brief §44: "امسال کنکور دادی؟" is the only thing separating a school-leaver from every other
adult, and it decides whether +18 leads the reveal. It is one question on the world home rather
than a fourth world, because §45 is explicit that +18 must not be pushed at children.

**`diagnostic` is separate from the experiences on purpose.** An experience produces a lesson; a
diagnostic produces a result. Only the diagnostic is allowed to say something about the visitor.

**Palettes are applied by `data-world`, not by class.** `KioskTheme` emits one custom-property
block per world; `Scene` stamps `meta.world` onto each scene wrapper and `WorldSurface` stamps
the active scene's world onto `<html>`. Scenes therefore carry their own colours rather than
borrowing whichever world the camera is in, while the document attribute paints the board and the
surround the stage sits on.

Anything with a **card fill** (`mat`, `pill`, `felt`, the chrome tray) must take
`--kiosk-card-text`, never `--kiosk-text`. In a light-board world the two are the same colour and
the mistake is invisible; in the navy and deep-green worlds they are opposites.

## The adults' question bank

`content/adult-scenarios.json` is the adults' questions, in its own file and its own shape, with
a `lastUpdated` date and a `note` addressed to whoever opens it next.

Brief §57 asks for exactly this: the team must be able to retire a scenario and write a new one
without a developer. So the bank is not embedded in a game's mechanics — a profile game names
`questionSource: "adult-scenarios"` instead of writing `questions`, and `content/select.ts`
resolves it. The loader checks that every dimension the bank scores is one the game declares,
because a schema cannot see across files.

The old four-question quiz, its result bands and `lib/scoring.ts` are gone. Brief §42 rules out
showing an adult a single score, and a generic test that ran before any experience is what §8
removes from the front of the product.

## Sound

`content/audio.json` is the whole sound design. Components ask for a cue **by meaning** —
`play("tap")`, `play("reveal")` — and the world decides how it sounds:

```jsonc
"tap": {
  "src": "/audio/ui/tap.wav",
  "byWorld": {
    "kids":   "/audio/kids/pop.wav",
    "teens":  "/audio/teens/click.wav",
    "adults": "/audio/adults/click.wav"
  }
}
```

Sound personality is part of a world's identity (brief §10), so the same gesture is a boing in
the kids' world and a restrained click in the adults'. Volumes are per world too: the kids' world
plays to a corridor, the adults' world plays to someone standing at the glass.

Rules the schema and the mixer enforce:

| Rule | Where |
|---|---|
| A cue needs a `src`, a `subtitle`, or both | `schema/audio.ts` — a written-but-unrecorded line still captions |
| Every world has a `worldVolume` | loader cross-check |
| A world's `greetingCue` names a real cue | loader cross-check |
| Same cue twice inside `debounceMs` is swallowed | `lib/audio/mixer.ts` |
| Never more than `maxConcurrent` sounds at once | `lib/audio/mixer.ts` — brief §54 bans stacking |
| Volume is master × world × cue gain | `lib/audio/mixer.ts` |

The assets are **generated, not licensed** — `npm run assets:sfx` synthesises every WAV into
`public/audio/`. Two reasons: the kiosk has to work with the network unplugged, so every sound
is a file on the machine; and one synth with one envelope shape and one tuning gives a coherent
family, which a bag of downloaded clips never is. They are uncompressed WAV because they decode
with no delay and the whole set is about a megabyte.

Voice lines are declared with their `subtitle` and no `src` until the team records them. That is
a valid, useful state, not a placeholder: the line still reaches the visitor.

**Browsers will not sound anything before a user gesture.** The attract loop is therefore silent
by design; the first tap — always the one entering the gateway — unlocks the kiosk.

## Event configuration

`content/event.json` holds everything that changes when the booth moves to a different event:
opening hours, the mini-activity running order, and which product each audience is led with.

Nothing in that file may be reached by editing a component. The rules it drives:

| Field | Effect |
|---|---|
| `defaultProductOrder` / `audienceProductOrder` | Which product leads any listing, per audience |
| `schedule` | `[{ time, activityId }]` — validated against `activities.json` at build time |
| `attract` | The hook and the CTA on the attract loop. The teaser under each portal lives on the world, in `worlds.json` |

`activities.json` stays the reusable catalogue of what the booth *can* run; `event.json` decides
when each one is actually on. Taking the same activities to a different event is a schedule edit.

## Imagery: landscape and portrait are different fields

`media` is the landscape image a card crops to a wide strip. `campaignPoster` is the printed
poster, which is portrait, and only the course detail scene — the one layout with a full-height
column to give it — ever renders it.

They are separate fields rather than one because the two crop in opposite directions. The +18
poster placed in a card's 210px strip showed a band of red background and none of its artwork.

## The collaboration form

Each track in `collaboration.json` carries a `form` block: every label, placeholder, hint,
success line and validation message the on-screen request form shows. It lives per track rather
than once, because a head teacher is asked for a school and an HR manager for a company.

Two fields are deliberately *not* in it:

- **The role options** are `audience[]` — the same list the scene already shows.
- **The interest options** are `cards[].title` — so adding a programme to the scene adds it to
  the form, and the two can never disagree.

`formCta` labels the button that opens the form; `cta` labels the one that goes to the QR panel.
Keep them plainly different — two buttons whose labels differ by one word read as one button.

Where the submissions go: [07 — The Lead Archive](../operations/07-lead-archive.md).

## Icons

Content names an icon; `components/ui/Icon.tsx` owns the geometry. The names are a Zod enum in
`schema/common.ts`, so naming an icon that does not exist fails `npm run validate:content`
rather than rendering an empty square at the booth.

Emoji are not used anywhere in the UI. The host font decides their colour and weight, so they
cannot be tinted to match a state, and at kiosk sizes they read as clip art pasted onto the design.

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
