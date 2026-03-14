"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import KorsanLogo from "./components/KorsanLogo";
import HeroBanner from "./components/HeroBanner";
import ContentRow from "./components/ContentRow";
import ContinueWatchingRow from "./components/ContinueWatchingRow";
import RecommendedRow from "./components/RecommendedRow";
import SearchBar from "./components/SearchBar";
import MovieGrid from "./components/MovieGrid";
import DetailModal from "./components/DetailModal";

const GENRE_ROWS = [
  { id: 28, title: "Aksiyon" },
  { id: 35, title: "Komedi" },
  { id: 878, title: "Bilim Kurgu" },
  { id: 27, title: "Korku" },
  { id: 18, title: "Drama" },
  { id: 10749, title: "Romantik" },
];

export default function HomePage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDiscover, setShowDiscover] = useState(false);
  const [genres, setGenres] = useState([]);
  const discoverRef = useRef(null);

  // Fetch genre list for Discover dropdown
  useEffect(() => {
    fetch("/api/genres?media=movie")
      .then((r) => r.json())
      .then((data) => setGenres(data.genres || []))
      .catch(() => {});
  }, []);

  // Close discover dropdown on outside click
  useEffect(() => {
    if (!showDiscover) return;
    const handler = (e) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target)) {
        setShowDiscover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDiscover]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query) {
      setResults(null);
      return;
    }
    setSearchLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => { setResults(data.results || []); setSearchLoading(false); })
      .catch(() => { setResults([]); setSearchLoading(false); });
  }, []);

  const handlePlay = (movie) => {
    const type = movie.media_type || (movie.first_air_date ? "tv" : "movie");
    if (type === "tv") {
      router.push(`/watch?id=${movie.id}&type=tv&season=1&episode=1`);
    } else {
      router.push(`/watch?id=${movie.id}&type=movie`);
    }
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };

  const isSearching = searchQuery.length > 0;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="/" className="navbar-brand">
            <KorsanLogo size={34} />
            <span className="navbar-logo">KORSANFLIX</span>
          </a>

          {/* Discover dropdown */}
          <div className="discover-wrapper" ref={discoverRef}>
            <button
              className="discover-btn"
              onClick={() => setShowDiscover(!showDiscover)}
            >
              Kesfet
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showDiscover && (
              <div className="discover-dropdown">
                <div className="discover-dropdown__title">Kategoriler</div>
                <div className="discover-dropdown__grid">
                  {genres.map((g) => (
                    <a
                      key={g.id}
                      href={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
                      className="discover-dropdown__item"
                      onClick={() => setShowDiscover(false)}
                    >
                      {g.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-search">
          <SearchBar onSearch={handleSearch} />
        </div>
      </nav>

      <main className="browse">
        {isSearching ? (
          <div className="search-results-container">
            <MovieGrid
              items={results || []}
              label={`"${searchQuery}" icin sonuclar`}
              loading={searchLoading}
              onCardClick={handleCardClick}
            />
          </div>
        ) : (
          <>
            <HeroBanner onPlay={handlePlay} onDetail={handleCardClick} />
            <div className="rows-container">
              <ContinueWatchingRow />
              <RecommendedRow onCardClick={handleCardClick} />
              <ContentRow title="Bu Hafta Trend"     type="trending"     onCardClick={handleCardClick} />
              <ContentRow title="Populer Filmler"    type="popular"      onCardClick={handleCardClick} />
              <ContentRow title="Vizyonda"           type="now_playing"  onCardClick={handleCardClick} />

              {/* Genre rows */}
              {GENRE_ROWS.map((g) => (
                <ContentRow
                  key={g.id}
                  title={g.title}
                  type="genre"
                  genreId={g.id}
                  onCardClick={handleCardClick}
                />
              ))}

              <ContentRow title="En Cok Oy Alan"     type="top_rated"    onCardClick={handleCardClick} />
              <ContentRow title="Yakinda"            type="upcoming"     onCardClick={handleCardClick} />
              <ContentRow title="Populer Diziler"    type="tv_popular"   onCardClick={handleCardClick} />
              <ContentRow title="Trend Diziler"      type="tv_trending"  onCardClick={handleCardClick} />
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
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
