import { afterEach, describe, expect, it, vi } from "vitest"
import { createSessionId } from "./id"

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("createSessionId", () => {
  it("returns a v4 uuid", () => {
    expect(createSessionId()).toMatch(UUID_V4)
  })

  it("does not repeat itself", () => {
    const ids = new Set(Array.from({ length: 500 }, createSessionId))
    expect(ids.size).toBe(500)
  })

  /**
   * The regression this file exists for: over plain HTTP the page is not a
   * secure context and `crypto.randomUUID` is absent, which took down the whole
   * app because the session store is built at module load.
   */
  it("works when randomUUID is missing, as it is outside a secure context", () => {
    vi.stubGlobal("crypto", { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) })

    expect(() => createSessionId()).not.toThrow()
    expect(createSessionId()).toMatch(UUID_V4)
  })

  it("works with no Web Crypto at all", () => {
    vi.stubGlobal("crypto", undefined)

    expect(() => createSessionId()).not.toThrow()
    expect(createSessionId()).toMatch(UUID_V4)
  })
})
