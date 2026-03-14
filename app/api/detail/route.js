/**
 * GET /api/detail?id=12345&type=movie
 * GET /api/detail?id=12345&type=tv&season=2
 * GET /api/detail?id=12345&type=movie&similar=1
 * GET /api/detail?id=12345&type=movie&recommendations=1
 *
 * All responses localized via CF-IPCountry header.
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
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "movie";
  const seasonNum = searchParams.get("season");
  const similar = searchParams.get("similar");
  const recommendations = searchParams.get("recommendations");
  const lang = tmdbLangParam(request);

  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  try {
    // Fetch season episodes
    if (seasonNum && type === "tv") {
      const res = await fetch(
        `${TMDB_BASE}/tv/${id}/season/${seasonNum}?api_key=${apiKey}${lang}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return Response.json(await res.json());
    }

    // Fetch similar
    if (similar) {
      const res = await fetch(
        `${TMDB_BASE}/${type}/${id}/similar?api_key=${apiKey}&page=1${lang}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return Response.json(await res.json());
    }

    // Fetch recommendations
    if (recommendations) {
      const res = await fetch(
        `${TMDB_BASE}/${type}/${id}/recommendations?api_key=${apiKey}&page=1${lang}`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return Response.json(await res.json());
    }

    // Default: full detail + videos
    const res = await fetch(
      `${TMDB_BASE}/${type}/${id}?api_key=${apiKey}&append_to_response=videos${lang}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return Response.json(await res.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
