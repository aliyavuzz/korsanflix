/**
 * GET /api/detail?id=12345&type=movie
 *
 * Film/dizi detaylarını ve YouTube trailer videolarını döner.
 * append_to_response=videos ile tek istekte hem detay hem videolar gelir.
 */
export const runtime = 'edge';

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "TMDB_API_KEY not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "movie";

  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/${type}/${id}?api_key=${apiKey}&append_to_response=videos`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
