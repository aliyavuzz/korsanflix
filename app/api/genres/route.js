/**
 * GET /api/genres?media=movie|tv
 * Returns TMDB genre list for the given media type.
 */
import { tmdbLangParam } from "../../lib/locale";

export const runtime = "edge";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "TMDB_API_KEY not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const media = searchParams.get("media") || "movie";
  const lang = tmdbLangParam(request);

  try {
    const res = await fetch(
      `${TMDB_BASE}/genre/${media}/list?api_key=${apiKey}${lang}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return Response.json(await res.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
