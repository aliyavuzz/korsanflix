"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "./components/HeroBanner";
import ContentRow from "./components/ContentRow";
import SearchBar from "./components/SearchBar";
import MovieGrid from "./components/MovieGrid";
import DetailModal from "./components/DetailModal";

/**
 * Ana sayfa — Netflix tarzı:
 * - Üstte arama çubuğu (navbar)
 * - Hero banner (rastgele trending film)
 * - Kategori sıraları (yatay kaydırma)
 * - Arama yapılınca grid'e geçiş
 * - Film kartına tıklanınca detay modalı
 */
export default function HomePage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

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
    const type = movie.media_type || "movie";
    router.push(`/watch?id=${movie.id}&type=${type}`);
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };

  const isSearching = searchQuery.length > 0;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-logo">KORSANFLIX</span>
        <div className="navbar-search">
          <SearchBar onSearch={handleSearch} />
        </div>
      </nav>

      <main className="browse">
        {isSearching ? (
          <div className="search-results-container">
            <MovieGrid
              items={results || []}
              label={`"${searchQuery}" için sonuçlar`}
              loading={searchLoading}
            />
          </div>
        ) : (
          <>
            <HeroBanner onPlay={handlePlay} onDetail={handleCardClick} />
            <div className="rows-container">
              <ContentRow title="Bu Hafta Trend"     type="trending"     onCardClick={handleCardClick} />
              <ContentRow title="Popüler Filmler"    type="popular"      onCardClick={handleCardClick} />
              <ContentRow title="Vizyonda"           type="now_playing"  onCardClick={handleCardClick} />
              <ContentRow title="En Çok Oy Alan"     type="top_rated"    onCardClick={handleCardClick} />
              <ContentRow title="Yakında"            type="upcoming"     onCardClick={handleCardClick} />
              <ContentRow title="Popüler Diziler"    type="tv_popular"   onCardClick={handleCardClick} />
              <ContentRow title="Trend Diziler"      type="tv_trending"  onCardClick={handleCardClick} />
            </div>
          </>
        )}
      </main>

      {/* Detay Modalı */}
      {selectedMovie && (
        <DetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </>
  );
}
