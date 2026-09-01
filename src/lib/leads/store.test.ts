import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import type { LeadSubmission } from "./schema"

/**
 * The store reads its directory from the frozen server config at import time, so
 * each test imports a fresh module graph pointed at its own temp directory.
 */
async function withStore(dir: string) {
  vi.resetModules()
  process.env.LEADS_DATA_DIR = dir
  return import("./store")
}

const SUBMISSION: LeadSubmission = {
  track: "schools",
  name: "مریم رضایی",
  role: "مدیر مدرسه",
  organization: "دبیرستان نمونه",
  mobile: "09121234567",
  city: "تهران",
  interests: ["یک روز متفاوت"],
  notes: "",
}

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "leads-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
  delete process.env.LEADS_DATA_DIR
})

describe("isLeadId", () => {
  it("rejects ids that could escape the archive directory", async () => {
    const { isLeadId } = await withStore(dir)
    expect(isLeadId("../../../etc/passwd")).toBe(false)
    expect(isLeadId("20260901-141500-deadbeef/../x")).toBe(false)
    expect(isLeadId("20260901-141500-deadbeef")).toBe(true)
  })
})

describe("the archive", () => {
  it("stores a submission and reads it back whole", async () => {
    const { saveLead, readLead } = await withStore(dir)

    const saved = await saveLead(SUBMISSION)
    const found = await readLead(saved.id)

    expect(found).toMatchObject(SUBMISSION)
    expect(found?.submittedAt).toBe(saved.submittedAt)
  })

  it("creates the directory on the first submission", async () => {
    const missing = path.join(dir, "nested", "leads")
    const { saveLead } = await withStore(missing)

    await saveLead(SUBMISSION)

    expect(await readdir(missing)).toHaveLength(1)
  })

  it("lists newest first", async () => {
    const { saveLead, listLeads } = await withStore(dir)

    const first = await saveLead(SUBMISSION)
    const second = await saveLead({ ...SUBMISSION, name: "علی محمدی" })

    const ids = (await listLeads()).map((record) => record.id)
    expect(ids).toEqual([second.id, first.id].sort().reverse())
  })

  it("skips an unreadable file rather than failing the whole listing", async () => {
    const { saveLead, listLeads } = await withStore(dir)
    const good = await saveLead(SUBMISSION)
    await writeFile(path.join(dir, "20200101-000000-aaaaaaaa.json"), "{ not json")

    const records = await listLeads()

    expect(records.map((record) => record.id)).toEqual([good.id])
  })

  it("deletes one lead and reports a miss", async () => {
    const { saveLead, deleteLead, readLead } = await withStore(dir)
    const saved = await saveLead(SUBMISSION)

    expect(await deleteLead(saved.id)).toBe(true)
    expect(await readLead(saved.id)).toBeNull()
    expect(await deleteLead(saved.id)).toBe(false)
  })

  it("empties the archive and counts what it removed", async () => {
    const { saveLead, deleteAllLeads, listLeads } = await withStore(dir)
    await saveLead(SUBMISSION)
    await saveLead({ ...SUBMISSION, track: "organizations" })

    expect(await deleteAllLeads()).toBe(2)
    expect(await listLeads()).toEqual([])
  })

  it("returns an empty archive when the directory has never been written", async () => {
    const { listLeads } = await withStore(path.join(dir, "absent"))
    expect(await listLeads()).toEqual([])
  })
})
