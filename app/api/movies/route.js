/**
 * GET /api/movies?type=popular|trending|genre&genre_id=28&page=1
 *
 * Proxies TMDB requests server-side so the API key stays secret.
 * Supports locale via CF-IPCountry header.
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
  const type = searchParams.get("type") || "popular";
  const page = searchParams.get("page") || "1";
  const genreId = searchParams.get("genre_id");
  const lang = tmdbLangParam(request);

  // Genre discovery endpoint
  if (type === "genre" && genreId) {
    try {
      const res = await fetch(
        `${TMDB_BASE}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc${lang}`,
        { next: { revalidate: 600 } }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return Response.json(await res.json());
    } catch (err) {
      return Response.json({ error: err.message }, { status: 502 });
    }
  }

  // TV genre discovery
  if (type === "tv_genre" && genreId) {
    try {
      const res = await fetch(
        `${TMDB_BASE}/discover/tv?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc${lang}`,
        { next: { revalidate: 600 } }
      );
      if (!res.ok) throw new Error(`TMDB ${res.status}`);
      return Response.json(await res.json());
    } catch (err) {
      return Response.json({ error: err.message }, { status: 502 });
    }
  }

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
    const res = await fetch(`${url}?api_key=${apiKey}&page=${page}${lang}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`TMDB responded ${res.status}`);
    return Response.json(await res.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
