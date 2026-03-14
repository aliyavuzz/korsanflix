"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import KorsanLogo from "../../components/KorsanLogo";
import DetailModal from "../../components/DetailModal";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

function GenreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const genreId = params.id;
  const genreName = searchParams.get("name") || "Kategori";

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const loaderRef = useRef(null);

  const fetchPage = useCallback(
    (p) => {
      if (loading || p > totalPages) return;
      setLoading(true);
      fetch(`/api/movies?type=genre&genre_id=${genreId}&page=${p}`)
        .then((r) => r.json())
        .then((data) => {
          setItems((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const fresh = (data.results || []).filter(
              (m) => m.poster_path && !existing.has(m.id)
            );
            return [...prev, ...fresh];
          });
          setTotalPages(data.total_pages || 1);
          setPage(p);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [genreId, loading, totalPages]
  );

  // Initial fetch
  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          fetchPage(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, totalPages, loading, fetchPage]);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar--solid">
        <div className="navbar-left">
          <a href="/" className="navbar-brand">
            <KorsanLogo size={34} />
            <span className="navbar-logo">KORSANFLIX</span>
          </a>
        </div>
        <button className="back-btn" onClick={() => router.push("/")}>
          Ana Sayfa
        </button>
      </nav>

      <main className="genre-page">
        <h1 className="genre-page__title">{genreName}</h1>
        <div className="genre-page__grid">
          {items.map((item) => (
            <button
              key={item.id}
              className="movie-card"
              onClick={() => setSelectedMovie(item)}
              title={item.title || item.name}
            >
              <div className="poster-wrapper">
                <Image
                  src={`${TMDB_IMG}${item.poster_path}`}
                  alt={item.title || item.name || ""}
                  width={250}
                  height={375}
                  className="poster-img"
                />
              </div>
              <span className="movie-title">{item.title || item.name}</span>
            </button>
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} className="genre-page__loader">
          {loading && <span>Yukleniyor...</span>}
        </div>
      </main>

      {selectedMovie && (
        <DetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSwitchMovie={setSelectedMovie}
        />
      )}
    </>
  );
}

export default function GenrePage() {
  return (
    <Suspense fallback={<div className="player-loading">Yukleniyor...</div>}>
      <GenreContent />
    </Suspense>
  );
}
