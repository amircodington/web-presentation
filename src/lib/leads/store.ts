import "server-only"
import { randomBytes } from "node:crypto"
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { kioskConfig } from "@/config/kiosk.config"
import { serverConfig } from "@/config/server.config"
import { LeadRecordSchema, type LeadRecord, type LeadSubmission } from "./schema"

/**
 * The lead archive: one JSON file per submission in a directory that is a Docker
 * volume in production.
 *
 * A directory of small files rather than a database is a deliberate fit to the
 * deployment — the booth machine may be power-cycled mid-write, has no operator,
 * and the archive has to be recoverable by a non-developer with a file manager.
 * A partly-written file loses one lead; a corrupt database loses the festival.
 */

/** Filenames are the sort key, so the timestamp leads and is fixed-width. */
const ID_PATTERN = /^\d{8}-\d{6}-[0-9a-f]{8}$/

/**
 * The archive directory is configuration, so the path is only known at runtime.
 * Next's build-time tracing cannot see that and, left alone, concludes it must
 * ship the entire project alongside the route; the pragma tells it not to try.
 */
const root = () =>
  path.resolve(/* turbopackIgnore: true */ process.cwd(), serverConfig.leads.dataDir)

const fileFor = (id: string) => path.join(root(), `${id}.json`)

function createId(at: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, "0")
  const stamp =
    `${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}` +
    `-${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`
  return `${stamp}-${randomBytes(4).toString("hex")}`
}

/**
 * Rejects any id that did not come from `createId`.
 *
 * The id arrives from the URL, is concatenated into a path, and would otherwise
 * let `../../etc/passwd` out of the archive directory.
 */
export function isLeadId(value: string): boolean {
  return ID_PATTERN.test(value)
}

export async function saveLead(submission: LeadSubmission): Promise<LeadRecord> {
  const at = new Date()
  const record: LeadRecord = {
    ...submission,
    id: createId(at),
    submittedAt: at.toISOString(),
    appVersion: kioskConfig.version,
  }

  await mkdir(root(), { recursive: true })
  // `wx` so a colliding id fails loudly instead of overwriting a real lead.
  await writeFile(fileFor(record.id), JSON.stringify(record, null, 2) + "\n", { flag: "wx" })
  return record
}

export async function readLead(id: string): Promise<LeadRecord | null> {
  if (!isLeadId(id)) return null
  try {
    const parsed = LeadRecordSchema.safeParse(JSON.parse(await readFile(fileFor(id), "utf8")))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * Every stored lead, newest first.
 *
 * A file that fails to parse is skipped rather than thrown on: one hand-edited
 * or half-written file must not take the whole archive page down.
 */
export async function listLeads(): Promise<LeadRecord[]> {
  let names: string[]
  try {
    names = await readdir(root())
  } catch {
    return []
  }

  const ids = names
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length))
    .filter(isLeadId)
    .sort()
    .reverse()

  const records = await Promise.all(ids.map(readLead))
  return records.filter((record): record is LeadRecord => record !== null)
}

/** Returns false when the id was never there, so the route can answer 404. */
export async function deleteLead(id: string): Promise<boolean> {
  if (!isLeadId(id)) return false
  try {
    await rm(fileFor(id))
    return true
  } catch {
    return false
  }
}

/** Empties the archive, returning how many files went. */
export async function deleteAllLeads(): Promise<number> {
  const records = await listLeads()
  const results = await Promise.all(records.map((record) => deleteLead(record.id)))
  return results.filter(Boolean).length
}
