"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

/**
 * /watch?id=12345&type=movie
 * /watch?id=12345&type=tv&season=1&episode=3
 *
 * Aktif vidsrc domain'ini sunucu proxy'mizden çeker,
 * ardından tam ekran iframe oynatıcı render eder.
 *
 * Embed URL formatları (API dokümanına göre):
 *   Film:  {BASE}/embed/movie?tmdb={ID}
 *   Dizi:  {BASE}/embed/tv?tmdb={ID}
 *   Bölüm: {BASE}/embed/tv?tmdb={ID}&season={S}&episode={E}
 */
function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tmdbId = searchParams.get("id");
  const mediaType = searchParams.get("type") || "movie";
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  const [vidsrcBase, setVidsrcBase] = useState(null);
  const [error, setError] = useState(null);

  // Aktif vidsrc domain'ini çöz
  useEffect(() => {
    fetch("/api/vidsrc-domain")
      .then((r) => r.json())
      .then((data) => setVidsrcBase(data.domain))
      .catch((err) => setError(err.message));
  }, []);

  if (!tmdbId) {
    return (
      <div className="player-page">
        <p className="player-error">Film/dizi ID bulunamadı.</p>
        <button className="back-btn" onClick={() => router.push("/")}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  // Embed URL'ini medya türüne göre oluştur
  let embedUrl = null;
  if (vidsrcBase) {
    if (mediaType === "tv") {
      // Sezon ve bölüm varsa bölüm URL'i, yoksa genel dizi URL'i
      embedUrl = `${vidsrcBase}/embed/tv?tmdb=${tmdbId}`;
      if (season) embedUrl += `&season=${season}`;
      if (episode) embedUrl += `&episode=${episode}`;
      embedUrl += `&ds_lang=tr&autoplay=1`;
    } else {
      embedUrl = `${vidsrcBase}/embed/movie?tmdb=${tmdbId}&ds_lang=tr&autoplay=1`;
    }
  }

  // Sezon/bölüm değişince URL'i güncelle
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    // Sezon değişince bölümü 1'e sıfırla
    if (key === "season") {
      params.set("episode", "1");
    }
    router.replace(`/watch?${params.toString()}`);
  };

  return (
    <div className="player-page">
      {/* Üst bar */}
      <div className="player-topbar">
        <button className="back-btn" onClick={() => router.push("/")}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Ana Sayfa
        </button>

        {/* Dizi için sezon/bölüm seçici */}
        {mediaType === "tv" && (
          <div className="episode-controls">
            <label>
              Sezon
              <input
                type="number"
                min="1"
                defaultValue={season || 1}
                className="ep-input"
                onBlur={(e) => updateParam("season", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && updateParam("season", e.target.value)
                }
              />
            </label>
            <label>
              Bölüm
              <input
                type="number"
                min="1"
                defaultValue={episode || 1}
                className="ep-input"
                onBlur={(e) => updateParam("episode", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && updateParam("episode", e.target.value)
                }
              />
            </label>
          </div>
        )}
      </div>

      {/* Oynatıcı */}
      <div className="player-container">
        {error && <p className="player-error">Hata: {error}</p>}

        {!vidsrcBase && !error && (
          <div className="player-loading">Video kaynağı çözülüyor...</div>
        )}

        {embedUrl && (
          <iframe
            src={embedUrl}
            className="player-iframe"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={<div className="player-loading">Oynatıcı yükleniyor...</div>}
    >
      <Player />
    </Suspense>
  );
}
