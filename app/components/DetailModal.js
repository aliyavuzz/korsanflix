"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";

/**
 * Film/dizi detay modalı.
 * - YouTube trailer arka planda oynar
 * - "Izle" butonuna tıklanınca trailer durur, vidsrc iframe açılır
 * - "Kapat" butonu modalı kapatır
 */
export default function DetailModal({ movie, onClose }) {
  const router = useRouter();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [vidsrcDomain, setVidsrcDomain] = useState(null);

  const mediaType = movie.media_type || "movie";
  const title = movie.title || movie.name || "";

  // Film detaylarını ve trailer'ı çek
  useEffect(() => {
    setLoading(true);
    setIsStreaming(false);
    fetch(`/api/detail?id=${movie.id}&type=${mediaType}`)
      .then((r) => r.json())
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [movie.id, mediaType]);

  // Vidsrc domain'ini çek
  useEffect(() => {
    fetch("/api/vidsrc-domain")
      .then((r) => r.json())
      .then((data) => setVidsrcDomain(data.domain));
  }, []);

  // ESC ile kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Body scroll kilitle
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Trailer YouTube key
  const trailerKey = detail?.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  )?.key || detail?.videos?.results?.[0]?.key;

  // Vidsrc embed URL
  let streamUrl = null;
  if (vidsrcDomain && movie.id) {
    if (mediaType === "tv") {
      streamUrl = `${vidsrcDomain}/embed/tv?tmdb=${movie.id}&season=1&episode=1&ds_lang=tr&autoplay=1`;
    } else {
      streamUrl = `${vidsrcDomain}/embed/movie?tmdb=${movie.id}&ds_lang=tr&autoplay=1`;
    }
  }

  // Türler
  const genres = detail?.genres?.map((g) => g.name).join(", ") || "";
  const year = (detail?.release_date || detail?.first_air_date || "").substring(0, 4);
  const runtime = detail?.runtime ? `${Math.floor(detail.runtime / 60)}s ${detail.runtime % 60}dk` : "";
  const rating = detail?.vote_average ? detail.vote_average.toFixed(1) : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Kapat butonu */}
        <button className="modal-close" onClick={onClose} aria-label="Kapat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Video alanı */}
        <div className="modal-video">
          {isStreaming && streamUrl ? (
            <>
              <iframe
                src={streamUrl}
                className="modal-iframe"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
              />
              <button
                className="modal-back-btn"
                onClick={() => setIsStreaming(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Geri
              </button>
            </>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
              className="modal-iframe"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : movie.backdrop_path ? (
            <Image
              src={`${TMDB_IMG}${movie.backdrop_path}`}
              alt={title}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="modal-video-placeholder" />
          )}

          {/* Gradient overlay + Başlık + Butonlar (sadece streaming değilken) */}
          {!isStreaming && (
            <div className="modal-video-overlay">
              <h2 className="modal-title">{title}</h2>
              <div className="modal-actions">
                <button
                  className="hero-btn hero-btn--play"
                  onClick={() => {
                    if (streamUrl) {
                      setIsStreaming(true);
                    } else {
                      router.push(`/watch?id=${movie.id}&type=${mediaType}`);
                    }
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Izle
                </button>
                <button
                  className="hero-btn hero-btn--info"
                  onClick={() => router.push(`/watch?id=${movie.id}&type=${mediaType}`)}
                >
                  Tam Ekran
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detay bilgileri */}
        {!isStreaming && (
          <div className="modal-info">
            {loading ? (
              <p className="modal-loading">Yükleniyor...</p>
            ) : (
              <>
                <div className="modal-meta">
                  {rating && <span className="modal-rating">{rating} puan</span>}
                  {year && <span className="modal-year">{year}</span>}
                  {runtime && <span className="modal-runtime">{runtime}</span>}
                </div>
                {detail?.overview && (
                  <p className="modal-overview">{detail.overview}</p>
                )}
                {genres && (
                  <p className="modal-genres">
                    <span className="modal-genres-label">Türler:</span> {genres}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
