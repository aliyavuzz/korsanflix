/**
 * GET /api/search?q=inception&page=1
 *
 * Searches TMDB for movies AND TV shows matching the query.
 * Returns combined results with a `media_type` field on each item.
 */

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "TMDB_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  if (!query.trim()) {
    return Response.json({ results: [], total_results: 0 });
  }

  try {
    // multi search returns movies, tv, and people — we filter to movies+tv
    const res = await fetch(
      `${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&page=${page}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      throw new Error(`TMDB responded ${res.status}`);
    }

    const data = await res.json();

    // Filter out "person" results — keep only movie & tv
    data.results = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    return Response.json(data);
  } catch (err) {
    console.error("TMDB search error:", err.message);
    return Response.json({ error: err.message }, { status: 502 });
  }
}
