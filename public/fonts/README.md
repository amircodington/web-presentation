# Fonts

`Vazirmatn-Regular.ttf` and `Vazirmatn-Bold.ttf`, from
[Vazirmatn v33.0.3](https://github.com/rastikerdar/vazirmatn) (SIL Open Font License 1.1).

These are for the **server-rendered lead PDF only**. The screen gets its Vazirmatn from
`next/font/google` in `src/app/layout.tsx`, which self-hosts a subset at build time.

They live here rather than in `node_modules` because the PDF route resolves them with a
static `process.cwd()` path: Turbopack rewrites `require.resolve` to a module id, and any
path built at runtime makes Next trace the whole project into the standalone output. `public/`
is copied into the runner image whole, so this works identically in dev, in `next start`, and
in the container.

To update, replace both files and change the version above.
