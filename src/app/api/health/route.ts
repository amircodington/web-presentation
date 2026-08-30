import { kioskConfig } from "@/config/kiosk.config"

export const dynamic = "force-dynamic"

/** Liveness probe for the container healthcheck and the pre-festival checklist. */
export function GET() {
  return Response.json({ status: "ok", version: kioskConfig.version })
}
