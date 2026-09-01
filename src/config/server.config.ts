import "server-only"

/**
 * Server-only view over the environment, kept apart from `kiosk.config.ts`
 * because that module is imported by client components and every key it reads
 * is inlined into the browser bundle at build time (AGENTS.md §5).
 *
 * Nothing here may ever be referenced from a `"use client"` module: the access
 * token would ship to every visitor's browser. The `server-only` import above
 * turns that mistake into a build error rather than a leak.
 */

const env = process.env

/**
 * Directory the lead archive is written to. In production this is a Docker
 * volume, so submissions survive a rebuild and a rollback — the whole reason
 * the archive is files on a disk rather than rows in a database.
 */
const dataDir = env.LEADS_DATA_DIR?.trim() || ".data/leads"

/**
 * Shared secret for the archive routes. Deliberately has no fallback: with a
 * default value an operator who never sets it would publish every visitor's
 * phone number to anyone who guessed the URL. Unset means the archive is
 * closed, which is the safe way to fail.
 */
const accessToken = env.LEADS_ACCESS_TOKEN?.trim() || ""

export const serverConfig = Object.freeze({
  leads: Object.freeze({
    dataDir,
    accessToken,
    /** Rejects an oversized body before it is parsed. */
    maxBodyBytes: Number(env.LEADS_MAX_BODY_BYTES ?? 8_192),
  }),
})

export type ServerConfig = typeof serverConfig
