"use client";

import MovieCard from "./MovieCard";

/**
 * Renders a labeled grid of movie/TV cards.
 */
export default function MovieGrid({ items, label, loading }) {
  if (loading) {
    return (
      <section className="grid-section">
        <h2 className="grid-label">{label}</h2>
        <div className="loading-indicator">Yükleniyor...</div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return (
      <section className="grid-section">
        <h2 className="grid-label">{label}</h2>
        <p className="no-results">Sonuç bulunamadı.</p>
      </section>
    );
  }

  return (
    <section className="grid-section">
      <h2 className="grid-label">{label}</h2>
      <div className="movie-grid">
        {items.map((item) => (
          <MovieCard key={`${item.media_type || "m"}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
