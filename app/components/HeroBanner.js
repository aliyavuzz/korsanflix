"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const TMDB_IMG = "https://image.tmdb.org/t/p/original";
const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w780";

/**
 * Netflix tarzı hero banner. Trending filmlerden rastgele birini seçip
 * backdrop gösterir. "Izle" ve "Detay" butonları içerir.
 */
export default function HeroBanner({ onPlay, onDetail }) {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch("/api/movies?type=trending")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.results || []).filter((m) => m.backdrop_path);
        if (list.length > 0) {
          setMovie(list[Math.floor(Math.random() * Math.min(5, list.length))]);
        }
      })
      .catch(() => {});
  }, []);

  if (!movie) return <div className="hero-banner hero-banner--loading" />;

  const title = movie.title || movie.name;

  return (
    <div className="hero-banner">
      <div className="hero-backdrop">
        <Image
          src={`${TMDB_IMG}${movie.backdrop_path}`}
          alt={title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="hero-gradient-bottom" />
        <div className="hero-gradient-left" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-buttons">
          <button
            className="hero-btn hero-btn--play"
            onClick={() => onPlay(movie)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Izle
          </button>
          <button
            className="hero-btn hero-btn--info"
            onClick={() => onDetail(movie)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Detay
          </button>
        </div>
      </div>
    </div>
  );
}
