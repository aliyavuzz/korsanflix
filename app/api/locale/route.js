/**
 * GET /api/locale
 * Returns the detected locale based on CF-IPCountry header.
 * Clients use this to set ds_lang on Vidsrc embeds.
 */
import { getLocaleFromRequest } from "../../lib/locale";

export const runtime = "edge";

export async function GET(request) {
  const locale = getLocaleFromRequest(request);
  return Response.json(locale);
}
