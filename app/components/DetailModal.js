"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";
const TMDB_IMG_SM = "https://image.tmdb.org/t/p/w300";
const TMDB_IMG_POSTER = "https://image.tmdb.org/t/p/w342";

export default function DetailModal({ movie, onClose }) {
  const router = useRouter();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  // TV episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");
  const title = movie.title || movie.name || "";
  const isTV = mediaType === "tv";

  // Fetch detail
  useEffect(() => {
    setLoading(true);
    setSimilar([]);
    setEpisodes([]);
    setSelectedSeason(1);
    fetch(`/api/detail?id=${movie.id}&type=${mediaType}`)
      .then((r) => r.json())
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [movie.id, mediaType]);

  // Fetch similar
  useEffect(() => {
    fetch(`/api/detail?id=${movie.id}&type=${mediaType}&similar=1`)
      .then((r) => r.json())
      .then((data) => setSimilar((data.results || []).filter((m) => m.poster_path).slice(0, 12)))
      .catch(() => {});
  }, [movie.id, mediaType]);

  // Fetch episodes when season changes (TV only)
  useEffect(() => {
    if (!isTV || !movie.id) return;
    setEpisodesLoading(true);
    fetch(`/api/detail?id=${movie.id}&type=tv&season=${selectedSeason}`)
      .then((r) => r.json())
      .then((data) => {
        setEpisodes(data.episodes || []);
        setEpisodesLoading(false);
      })
      .catch(() => {
        setEpisodes([]);
        setEpisodesLoading(false);
      });
  }, [movie.id, isTV, selectedSeason]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Trailer YouTube key
  const trailerKey = detail?.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  )?.key || detail?.videos?.results?.[0]?.key;

  // Metadata
  const genres = detail?.genres?.map((g) => g.name).join(", ") || "";
  const year = (detail?.release_date || detail?.first_air_date || "").substring(0, 4);
  const runtime = detail?.runtime ? `${Math.floor(detail.runtime / 60)}s ${detail.runtime % 60}dk` : "";
  const rating = detail?.vote_average ? detail.vote_average.toFixed(1) : "";
  const totalSeasons = detail?.number_of_seasons || 1;

  const handlePlay = (seasonNum, episodeNum) => {
    if (isTV) {
      const s = seasonNum || 1;
      const e = episodeNum || 1;
      router.push(`/watch?id=${movie.id}&type=tv&season=${s}&episode=${e}`);
    } else {
      router.push(`/watch?id=${movie.id}&type=movie`);
    }
    onClose();
  };

  const handleSimilarClick = (item) => {
    // We can't easily swap movie in modal, so navigate
    const type = item.media_type || mediaType;
    router.push(`/watch?id=${item.id}&type=${type}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Kapat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Video area - trailer or backdrop */}
        <div className="modal-video">
          {trailerKey ? (
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

          {/* Gradient overlay + Title + Play button */}
          <div className="modal-video-overlay">
            <h2 className="modal-title">{title}</h2>
            <div className="modal-actions">
              <button
                className="hero-btn hero-btn--play"
                onClick={() => handlePlay(selectedSeason, 1)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Izle
              </button>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="modal-info">
          {loading ? (
            <p className="modal-loading">Yukleniyor...</p>
          ) : (
            <>
              <div className="modal-meta">
                {rating && <span className="modal-rating">{rating} puan</span>}
                {year && <span className="modal-year">{year}</span>}
                {runtime && <span className="modal-runtime">{runtime}</span>}
                {isTV && detail?.number_of_seasons && (
                  <span className="modal-seasons">{detail.number_of_seasons} Sezon</span>
                )}
              </div>
              {detail?.overview && (
                <p className="modal-overview">{detail.overview}</p>
              )}
              {genres && (
                <p className="modal-genres">
                  <span className="modal-genres-label">Turler:</span> {genres}
                </p>
              )}
            </>
          )}
        </div>

        {/* TV Episode Selector */}
        {isTV && !loading && (
          <div className="modal-episodes">
            <div className="modal-episodes__header">
              <h3>Bolumler</h3>
              <select
                className="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {Array.from({ length: totalSeasons }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Sezon {i + 1}</option>
                ))}
              </select>
            </div>
            <div className="modal-episodes__list">
              {episodesLoading ? (
                <p className="modal-episodes__loading">Bolumler yukleniyor...</p>
              ) : episodes.length === 0 ? (
                <p className="modal-episodes__loading">Bolum bilgisi bulunamadi.</p>
              ) : (
                episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    className="modal-episode-card"
                    onClick={() => handlePlay(selectedSeason, ep.episode_number)}
                  >
                    <div className="modal-episode-card__thumb">
                      {ep.still_path ? (
                        <Image
                          src={`${TMDB_IMG_SM}${ep.still_path}`}
                          alt={ep.name || ""}
                          width={185}
                          height={104}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <div className="modal-episode-card__placeholder">
                          <span>{ep.episode_number}</span>
                        </div>
                      )}
                    </div>
                    <div className="modal-episode-card__info">
                      <div className="modal-episode-card__top">
                        <span className="modal-episode-card__num">{ep.episode_number}.</span>
                        <span className="modal-episode-card__title">{ep.name || `Bolum ${ep.episode_number}`}</span>
                      </div>
                      {ep.overview && (
                        <p className="modal-episode-card__overview">{ep.overview}</p>
                      )}
                    </div>
                    <svg className="modal-episode-card__play" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="11" /><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* More Like This (Similar) */}
        {similar.length > 0 && (
          <div className="modal-similar">
            <h3>Benzer Iceriklier</h3>
            <div className="modal-similar__grid">
              {similar.map((item) => (
                <button
                  key={item.id}
                  className="modal-similar__card"
                  onClick={() => handleSimilarClick(item)}
                  title={item.title || item.name}
                >
                  <Image
                    src={`${TMDB_IMG_POSTER}${item.poster_path}`}
                    alt={item.title || item.name || ""}
                    width={130}
                    height={195}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  <span className="modal-similar__title">{item.title || item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
