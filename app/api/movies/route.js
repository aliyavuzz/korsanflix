/**
 * GET /api/movies?type=popular|now_playing|trending&page=1
 *
 * Proxies TMDB requests server-side so the API key stays secret.
 * Returns the raw TMDB JSON (results array with id, title, poster_path, etc.).
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
  const type = searchParams.get("type") || "popular";
  const page = searchParams.get("page") || "1";

  const endpoints = {
    popular: `${TMDB_BASE}/movie/popular`,
    top_rated: `${TMDB_BASE}/movie/top_rated`,
    now_playing: `${TMDB_BASE}/movie/now_playing`,
    upcoming: `${TMDB_BASE}/movie/upcoming`,
    trending: `${TMDB_BASE}/trending/movie/week`,
    tv_popular: `${TMDB_BASE}/tv/popular`,
    tv_top_rated: `${TMDB_BASE}/tv/top_rated`,
    tv_trending: `${TMDB_BASE}/trending/tv/week`,
  };

  const url = endpoints[type] || endpoints.popular;

  try {
    const res = await fetch(`${url}?api_key=${apiKey}&page=${page}`, {
      next: { revalidate: 600 }, // cache 10 min
    });

    if (!res.ok) {
      throw new Error(`TMDB responded ${res.status}`);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("TMDB movies error:", err.message);
    return Response.json({ error: err.message }, { status: 502 });
  }
}
