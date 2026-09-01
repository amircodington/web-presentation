import { isAuthorised, notFound } from "@/lib/leads/access"
import { renderLeadsPdf } from "@/lib/leads/pdf"
import { deleteLead, readLead } from "@/lib/leads/store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

/** One lead as a single-page PDF, for handing to whoever follows it up. */
export async function GET(request: Request, context: Context): Promise<Response> {
  if (!isAuthorised(request)) return notFound()

  const { id } = await context.params
  const record = await readLead(id)
  if (!record) return notFound()

  const pdf = await renderLeadsPdf([record], "درخواست همکاری")
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="lead-${record.id}.pdf"`,
      "cache-control": "no-store",
    },
  })
}

export async function DELETE(request: Request, context: Context): Promise<Response> {
  if (!isAuthorised(request)) return notFound()

  const { id } = await context.params
  const deleted = await deleteLead(id)
  if (!deleted) return notFound()
  return Response.json({ deleted: id })
}
