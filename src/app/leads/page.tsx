import { notFound } from "next/navigation"
import { serverConfig } from "@/config/server.config"
import { LeadArchive } from "@/components/leads/LeadArchive"
import { listLeads } from "@/lib/leads/store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * The lead archive, gated on the token in the link.
 *
 * The check happens here rather than in the client component so that a wrong or
 * missing token gets the ordinary 404 page and never sees the archive's markup.
 * Nothing on the kiosk links here — the URL is handed to the booth lead and its
 * token lives in `.env.secrets`.
 *
 * The list is read on the server and the client half only mutates: after a
 * delete it calls `router.refresh()`, so this file stays the single place the
 * archive is read from.
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = "" } = await searchParams
  const expected = serverConfig.leads.accessToken
  if (!expected || token !== expected) notFound()

  return <LeadArchive token={token} records={await listLeads()} />
}
