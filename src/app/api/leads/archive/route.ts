import { isAuthorised, notFound } from "@/lib/leads/access"
import { leadsToCsv } from "@/lib/leads/csv"
import { renderLeadsPdf } from "@/lib/leads/pdf"
import { deleteAllLeads, listLeads } from "@/lib/leads/store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ARCHIVE_TITLE = "درخواست‌های همکاری"

/** `YYYY-MM-DD` in Tehran, for the download filename. */
function stampedName(extension: string): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date())
  return `wealth-club-leads-${day}.${extension}`
}

/**
 * The whole archive, as JSON for the archive page, or as a PDF or CSV download.
 *
 * `?format=` rather than content negotiation, because the archive page reaches
 * this route from a plain `<a href>` — the only kind of link a phone browser
 * reliably turns into a saved file.
 */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorised(request)) return notFound()

  const params = new URL(request.url).searchParams
  const format = params.get("format") ?? "json"
  const records = await listLeads()

  if (format === "pdf") {
    const pdf = await renderLeadsPdf(records, ARCHIVE_TITLE)
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${stampedName("pdf")}"`,
        "cache-control": "no-store",
      },
    })
  }

  if (format === "csv") {
    return new Response(leadsToCsv(records), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${stampedName("csv")}"`,
        "cache-control": "no-store",
      },
    })
  }

  // `?download=1` turns the same JSON into a saved file. The archive page reads
  // this route inline; the booth tablet offers it as the lossless nightly backup,
  // and a backup that opens in a tab is one nobody actually keeps.
  const headers: Record<string, string> = { "cache-control": "no-store" }
  if (params.get("download")) {
    headers["content-disposition"] = `attachment; filename="${stampedName("json")}"`
  }
  return Response.json({ count: records.length, records }, { headers })
}

/** Empties the archive. The one destructive action, so it names what it did. */
export async function DELETE(request: Request): Promise<Response> {
  if (!isAuthorised(request)) return notFound()
  const deleted = await deleteAllLeads()
  return Response.json({ deleted })
}
