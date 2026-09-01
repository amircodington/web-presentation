import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

/**
 * Physical CSS properties break RTL. Every one of these has a logical equivalent
 * that flips correctly: ml/mr -> ms/me, pl/pr -> ps/pe, left/right -> start/end.
 */
const PHYSICAL_CLASS =
  /(?:^|\s|:)(?:ml|mr|pl|pr|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-/

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${PHYSICAL_CLASS.source}/]`,
          message:
            "Physical CSS utility detected. Use logical properties (ms/me, ps/pe, start/end) — this app is RTL.",
        },
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            "Read configuration from '@/config/kiosk.config', never process.env directly.",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // The two config modules are the only permitted readers of process.env — and
    // a test that points one of them at a temp directory has to set it. The
    // engine owns the LTR maths space that must not use logical properties.
    files: [
      "src/config/kiosk.config.ts",
      "src/config/server.config.ts",
      "src/**/*.test.ts",
      "src/engine/**",
      "scripts/**",
      "*.config.*",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // The camera is an imperative animation layer: it writes transforms straight
    // onto a DOM node so a move costs one composited property rather than a React
    // render per frame. The compiler cannot verify that, and memoizing it away
    // would defeat the point.
    files: ["src/engine/use-camera.ts"],
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**", "out/**"] },
]

export default config
