import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      /**
       * Server-only modules are unit-tested in plain Node, which has no
       * `react-server` export condition — so the `server-only` marker resolves
       * to its throwing variant and the import fails before a test runs. This
       * is the stub Next would hand it on the server.
       */
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
