import "server-only"
import { timingSafeEqual } from "node:crypto"
import { serverConfig } from "@/config/server.config"

/**
 * Guards the archive routes.
 *
 * The archive holds visitors' names and phone numbers and is reached by an
 * unguessable link rather than a login, because the person opening it at the
 * booth is holding a phone in a loud hall and will not type a password. That
 * makes the link itself the credential: it goes in `.env.secrets`, never in a
 * QR code, and never in a button on the kiosk.
 */
export function isAuthorised(request: Request): boolean {
  const expected = serverConfig.leads.accessToken
  // An unset token closes the archive rather than opening it to everyone.
  if (!expected) return false

  const url = new URL(request.url)
  const supplied = request.headers.get("x-leads-token") ?? url.searchParams.get("token") ?? ""
  return safeEqual(supplied, expected)
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  // timingSafeEqual throws on a length mismatch, which would itself leak length.
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/** The 404 an unauthorised caller gets — the archive does not admit it exists. */
export function notFound(): Response {
  return new Response("Not found", { status: 404 })
}
