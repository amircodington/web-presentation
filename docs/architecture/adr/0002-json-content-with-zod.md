# 0002 — JSON content validated by Zod, no CMS

**Status:** Accepted · 2026-08-30

## Context

Prices, dates, copy and QR destinations will change late — the night before the festival, and
plausibly at the booth itself. A developer must not be required for those changes. The realistic
options were MDX per slide, a headless CMS, or plain JSON.

MDX suits prose but fits structured data (prices, quiz scoring, QR maps) badly, and Persian RTL
MDX authoring is fiddly. A CMS is another service to run, another thing that can be down, and
another network dependency at a venue.

## Decision

All content is plain JSON in `content/`, with a Zod schema per file, validated at build time by
`scripts/validate-content.ts` and again at runtime in `content/load.ts`.

## Consequences

**Positive.** Anyone can edit JSON with no toolchain. Schemas turn a typo into a failed build
rather than `undefined` on a two-metre screen — which is the specific disaster this is designed
to prevent. Types are inferred from the schemas, so content and code cannot drift. Nothing to
deploy, nothing to keep running.

**Negative.** No editing UI, so a malformed JSON file is a syntax error rather than a friendly
message. No content versioning beyond git. No preview before commit.

**Mitigation.** `npm run validate:content` gives a readable error report and runs pre-commit.
The admin overlay reloads content at the booth without a restart. If a CMS is ever needed,
`content/load.ts` is the single seam it would be introduced behind.
