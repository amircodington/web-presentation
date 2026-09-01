import { kioskConfig } from "@/config/kiosk.config"
import { serverConfig } from "@/config/server.config"
import { LeadSubmissionSchema } from "@/lib/leads/schema"
import { saveLead } from "@/lib/leads/store"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Accepts a collaboration request from the kiosk.
 *
 * Deliberately unauthenticated and write-only: the kiosk stands in a public hall
 * with no credential to hold, and a token baked into a client bundle is not one
 * either. Reading the archive back is a separate, guarded route.
 */
export async function POST(request: Request): Promise<Response> {
  if (!kioskConfig.features.leadForm) {
    return Response.json({ error: "disabled" }, { status: 404 })
  }

  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > serverConfig.leads.maxBodyBytes) {
    return Response.json({ error: "too-large" }, { status: 413 })
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > serverConfig.leads.maxBodyBytes) {
      return Response.json({ error: "too-large" }, { status: 413 })
    }
    body = JSON.parse(raw)
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 })
  }

  const parsed = LeadSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "invalid", issues: parsed.error.issues.map((issue) => issue.path.join(".")) },
      { status: 422 },
    )
  }

  try {
    const record = await saveLead(parsed.data)
    return Response.json({ id: record.id }, { status: 201 })
  } catch {
    // The disk is the one failure the visitor cannot do anything about, and the
    // detail belongs in the container log rather than in a response body.
    return Response.json({ error: "storage" }, { status: 500 })
  }
}
