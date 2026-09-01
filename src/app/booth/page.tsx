import { notFound } from "next/navigation"
import { content } from "@/content/load"
import { serverConfig } from "@/config/server.config"
import { BoothCapture } from "@/components/booth/BoothCapture"
import { listLeads } from "@/lib/leads/store"
import { tehranDay, toRow } from "@/lib/leads/view"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * The booth staff's capture tablet, gated on the token in the link.
 *
 * The check happens here rather than in the client component so a wrong or
 * missing token gets the ordinary 404 page and never sees the markup. Nothing on
 * the kiosk links here — the URL is handed to the booth lead and its token lives
 * in `.env.secrets`.
 *
 * Today's captures are read on the server and handed down so the tablet can warn
 * about a repeated mobile number without asking an unauthenticated endpoint
 * whether a given number is already on file.
 */
export default async function BoothPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = "" } = await searchParams
  const expected = serverConfig.leads.accessToken
  if (!expected || token !== expected) notFound()

  const today = tehranDay()
  const captured = (await listLeads())
    .map(toRow)
    .filter((row) => row.date === today)
    .map((row) => ({ id: row.id, name: row.name, mobile: row.mobile, time: row.time }))

  return <BoothCapture copy={content.booth} token={token} today={captured} />
}
