# Architecture Decision Records

One file per decision that is expensive to reverse. Adding an ADR is how a locked decision in
`AGENTS.md` §2 gets changed.

Format: Context → Decision → Consequences. Status is `Accepted`, `Superseded by NNNN`, or
`Deprecated`. **ADRs are never edited after acceptance** — a decision that changes gets a new
ADR that supersedes the old one, so the reasoning trail survives.

| # | Decision | Status |
|---|---|---|
| [0001](0001-custom-camera-over-impress-js.md) | Custom camera layer instead of impress.js or reveal.js | Accepted |
| [0002](0002-json-content-with-zod.md) | JSON content validated by Zod, no CMS | Accepted |
| [0003](0003-no-backend-qr-first.md) | No backend; QR-first lead capture | Accepted |
| [0004](0004-env-as-single-source-of-truth.md) | Committed root `.env` as the version SSOT | Accepted |
