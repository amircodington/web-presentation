/**
 * Generates a session identifier.
 *
 * `crypto.randomUUID` is restricted to secure contexts. The booth machine and
 * the server are both reached over plain HTTP on an IP address, which is not
 * one — so the method is simply absent there and calling it throws. It is
 * present on `localhost`, which is a secure context by definition, so this
 * fails nowhere in development and everywhere in production.
 *
 * `crypto.getRandomValues` carries no such restriction and is used to build a
 * conforming v4 UUID instead. The final `Math.random` branch exists only so
 * that a missing Web Crypto implementation degrades to a working kiosk rather
 * than a blank screen; the id labels one visitor's session for the length of
 * that session and is never a security boundary.
 */
export function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Version 4, variant 1, per RFC 4122 §4.4.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-")
}
