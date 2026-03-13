"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "./components/HeroBanner";
import ContentRow from "./components/ContentRow";
import ContinueWatchingRow from "./components/ContinueWatchingRow";
import RecommendedRow from "./components/RecommendedRow";
import SearchBar from "./components/SearchBar";
import MovieGrid from "./components/MovieGrid";
import DetailModal from "./components/DetailModal";

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
              label={`"${searchQuery}" icin sonuclar`}
              loading={searchLoading}
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
        />
      )}
    </>
  );
}
