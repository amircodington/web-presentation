# 02 — Code Structure

Every file has one obvious home. If you are unsure where something goes, it probably belongs
in `lib/` — and if it renders, in `components/`.

## Repository root

```text
web-presentation/
├── .env                        # committed. SSOT for versions + tunables (ops/02)
├── .env.secrets                # git-ignored. Never committed
├── .env.example                # documented template, mirrors .env keys with safe values
├── AGENTS.md                   # rules for agents and humans. Read first
├── CHANGELOG.md                # technical, English, generated from commits
├── CHANGELOG-USER.md           # user-facing, Persian, hand-written
├── README.md                   # 60-second quickstart only; depth lives in docs/
├── docker-compose.yml          # development
├── docker-compose.prod.yml     # production
├── Dockerfile                  # multi-stage: deps → builder → runner
├── docs/                       # this documentation
├── tasks/                      # plan.md + todo.md
├── content/                    # ALL editable content. The client's territory
├── public/                     # static assets served as-is
├── scripts/                    # release + content tooling
└── src/                        # application code
```

## `content/` — the client's territory

Plain JSON, no code, no build step to edit. Every file has a matching Zod schema in
`src/content/schema/` and is validated at build time and again at runtime on load.

```text
content/
├── brand.json           # name, colours, logo path, fonts
├── festival.json        # festival name, offer toggle, offer copy, valid-until date
├── courses.json         # the course catalogue
├── workshops.json       # dated workshop sessions
├── audiences.json       # the six audience segments and their copy
├── quiz.json            # questions, options, per-option scores
├── results.json         # result bands → headline, description, recommended product ids
├── offers.json          # festival pricing overrides
├── contact.json         # phone, site, instagram, bale
├── qr.json              # every QR destination URL, keyed by purpose
├── collaboration.json   # the B2B (schools) and B2G (organizations) tracks
├── activities.json      # live mini-workshops run at the booth
└── scenes.json          # scene graph: id, camera position, component, transition
```

`scenes.json` is the one file that is structure rather than copy — it is what makes the
presentation itself dynamic. Reordering the show, adding a scene, or changing a camera move is
a JSON edit, not a code change. Schema in [`03-presentation-engine.md`](03-presentation-engine.md).

## `src/` — application code

```text
src/
├── app/
│   ├── layout.tsx              # <html lang="fa" dir="rtl">, fonts, global providers
│   ├── page.tsx                # mounts <KioskCanvas />. The only route
│   ├── globals.css             # Tailwind layers, CSS custom properties from brand.json
│   ├── admin/page.tsx          # hidden overlay: version, CSV export, content reload
│   ├── leads/page.tsx          # the lead archive, gated on ?token=. Linked from nowhere
│   ├── booth/page.tsx          # the staff capture tablet, same token. Also linked from nowhere
│   └── api/
│       ├── health/route.ts     # liveness probe
│       └── leads/
│           ├── route.ts        # POST one collaboration request. Public, write-only
│           └── archive/        # GET list/PDF/CSV, DELETE. Token-guarded
│
├── engine/                     # the Prezi camera. Product-agnostic, zero content imports
│   ├── Camera.tsx              # the transforming node; consumes camera state
│   ├── Scene.tsx               # positions one scene in canvas space
│   ├── SceneGraph.tsx          # renders all scenes from scenes.json
│   ├── use-camera.ts           # imperative API: goTo, next, previous, home
│   ├── use-gestures.ts         # pinch-zoom, drag-pan, swipe, double-tap
│   ├── transitions.ts          # named easing/duration presets referenced by scenes.json
│   ├── projection.ts           # pure maths: scene transform → inverse camera transform
│   └── types.ts                # CameraState, SceneNode, TransitionSpec
│
├── components/
│   ├── kiosk/                  # AttractLoop, IdleReset, TouchHint, ProgressRail, LeadForm
│   ├── booth/                  # BoothCapture — the staff tablet, not part of the kiosk UI
│   ├── leads/                  # LeadArchive — the operator's view, not part of the kiosk UI
│   ├── scenes/                 # one component per scene type, named in scenes.json
│   ├── quiz/                   # QuestionCard, OptionButton, ScoreMeter, ResultReveal
│   ├── products/               # CourseCard, WorkshopCard, PriceTag, OfferBadge
│   ├── lead/                   # LeadForm, QrPanel, SuccessScreen
│   ├── games/                  # AllocationGame, MarketGame, JudgementGame
│   ├── charts/                 # PriceChart, ChipStackChart, ScoreGauge, ScheduleRail
│   ├── media/                  # BackgroundVideo, KenBurnsImage, ParticleField
│   └── ui/                     # Button, Chip, Icon, MotionIcon, Mascot, Logo, Photo
│                               # primitives only, no domain logic
│
├── content/
│   ├── schema/                 # one Zod schema per content file
│   ├── load.ts                 # reads + validates + freezes; the ONLY way to reach content
│   └── select.ts               # derived queries: activeCourses(), offerFor(courseId)
│
├── lib/
│   ├── games/                  # pure game logic: allocation rules, market price series,
│   │                           # and cast.ts — which character and mood a state produces
│   ├── schedule.ts             # pure: running order → next slot, countdown, day phase
│   ├── scoring.ts              # quiz answers → raw score
│   ├── recommendation.ts       # score + audience → ordered product ids
│   ├── idle.ts                 # inactivity detection and reset orchestration
│   ├── qr.ts                   # local QR rendering
│   ├── analytics.ts            # KPI counters into IndexedDB, no network
│   ├── leads/                  # server-only: schema, file store, access token, PDF, CSV,
│   │                           # and view.ts — the one projection both capture
│   │                           # shapes are flattened through
│   └── storage.ts              # IndexedDB wrapper
│
├── store/
│   └── session.ts              # Zustand KioskSession. One reset() clears everything
│
└── config/
    ├── kiosk.config.ts         # .env → typed frozen config. Safe on the client
    └── server.config.ts        # server-only keys and secrets. `server-only` bars client use
```

## The boundaries that matter

Three rules keep this from turning into a tangle.

**`engine/` never imports from `content/`, `components/scenes/`, or `store/`.** It knows about
coordinates and transitions, nothing about courses or quizzes. This is what would let the
engine be extracted into its own package later, and it is the fastest way to tell whether a
piece of logic belongs in the engine or in the app: if it mentions a course, it does not.

**Components never import `content/*.json` directly.** They go through `content/load.ts`, which
is the only place validation happens. A direct import bypasses Zod and is how an unvalidated
`"TBD"` ends up on a two-metre screen.

**Components never read `process.env`.** They read `kioskConfig`. One typed, frozen object,
one place to look when a timeout is wrong.

**Secrets never reach `kiosk.config.ts`.** Every key it reads is inlined into the browser
bundle at build time, so a token placed there is published. Server-only values live in
`server.config.ts`, whose `server-only` import turns a client import into a build error rather
than a leak. `src/lib/leads/` follows the same rule: everything that touches the disk or the
token imports `server-only`.

## Naming

| Kind | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `CourseCard.tsx` |
| Everything else | `kebab-case.ts` | `use-camera.ts` |
| Zod schema | `<content-file>.schema.ts` | `courses.schema.ts` |
| Scene component | `<SceneId>Scene.tsx` | `AttractScene.tsx` |
| Test | co-located `*.test.ts` | `scoring.test.ts` |

## Testing

| Type | Tool | Covers |
|---|---|---|
| Unit | Vitest | `lib/` (scoring, recommendation, idle), `engine/projection.ts` |
| Schema | Vitest | Every file in `content/` parses against its schema |
| Component | Vitest + Testing Library | Quiz flow, lead form validation |
| E2E | Playwright | Full journey at 1920×1080; idle reset clears session |
| Visual | Playwright screenshots | Each scene at rest, to catch RTL and layout regressions |

The schema tests matter more than they look: they are what turns "the client edited a JSON file
at 11pm" from an outage into a failed build.
