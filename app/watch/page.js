"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Image from "next/image";

const VIDSRC_BASE = "https://vidsrc-embed.ru";
const TMDB_IMG = "https://image.tmdb.org/t/p/w300";

function Player() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tmdbId = searchParams.get("id");
  const mediaType = searchParams.get("type") || "movie";
  const season = searchParams.get("season") || (mediaType === "tv" ? "1" : null);
  const episode = searchParams.get("episode") || (mediaType === "tv" ? "1" : null);

  const [detail, setDetail] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(Number(season) || 1);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dsLang, setDsLang] = useState("tr");
  const playerRef = useRef(null);

  // Fetch locale for ds_lang
  useEffect(() => {
    fetch("/api/locale")
      .then((r) => r.json())
      .then((data) => { if (data.dsLang) setDsLang(data.dsLang); })
      .catch(() => {});
  }, []);

  // Toggle native browser fullscreen on the player container
  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Fetch detail for title / season info
  useEffect(() => {
    if (!tmdbId) return;
    fetch(`/api/detail?id=${tmdbId}&type=${mediaType}`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => {});
  }, [tmdbId, mediaType]);

  // Fetch episodes when season changes (TV only)
  useEffect(() => {
    if (mediaType !== "tv" || !tmdbId) return;
    fetch(`/api/detail?id=${tmdbId}&type=tv&season=${selectedSeason}`)
      .then((r) => r.json())
      .then((data) => setEpisodes(data.episodes || []))
      .catch(() => setEpisodes([]));
  }, [tmdbId, mediaType, selectedSeason]);

  // Save to Continue Watching localStorage
  useEffect(() => {
    if (!tmdbId || !detail) return;
    try {
      const STORAGE_KEY = "continue_watching";
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const filtered = current.filter(
        (item) => !(item.id === Number(tmdbId) && item.type === mediaType)
      );
      const payload = {
        id: Number(tmdbId),
        type: mediaType,
        title: detail.title || detail.name || "",
        poster_path: detail.poster_path || "",
        backdrop_path: detail.backdrop_path || "",
        timestamp: Date.now(),
      };
      if (mediaType === "tv") {
        payload.season = Number(season) || 1;
        payload.episode = Number(episode) || 1;
      }
      const updated = [payload, ...filtered].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, [tmdbId, mediaType, detail, season, episode]);

  if (!tmdbId) {
    return (
      <div className="player-page">
        <p className="player-error">Film/dizi ID bulunamadi.</p>
        <button className="back-btn" onClick={() => router.push("/")}>
          Ana Sayfaya Don
        </button>
      </div>
    );
  }

  // Build embed URL
  let embedUrl;
  if (mediaType === "tv") {
    const s = season || "1";
    const e = episode || "1";
    embedUrl = `${VIDSRC_BASE}/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}&ds_lang=${dsLang}`;
  } else {
    embedUrl = `${VIDSRC_BASE}/embed/movie?tmdb=${tmdbId}&ds_lang=${dsLang}`;
  }

  const title = detail?.title || detail?.name || "";
  const totalSeasons = detail?.number_of_seasons || 1;
  const currentEp = Number(episode) || 1;

  const navigateEpisode = (s, e) => {
    router.replace(`/watch?id=${tmdbId}&type=tv&season=${s}&episode=${e}`);
  };

  return (
    <div className="player-page">
      {/* Top bar */}
      <div className="player-topbar">
        <button className="back-btn" onClick={() => router.push("/")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Ana Sayfa
        </button>
        {title && <span className="player-title">{title}</span>}
        {mediaType === "tv" && (
          <button
            className="episodes-toggle-btn"
            onClick={() => setShowEpisodes(!showEpisodes)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Bolumler
          </button>
        )}
      </div>

      <div className="player-body">
        {/* Player */}
        <div
          ref={playerRef}
          className={`player-container ${showEpisodes && mediaType === "tv" ? "player-container--with-sidebar" : ""}`}
        >
          <iframe
            src={embedUrl}
            className="player-iframe"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
          />
          <button
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam ekrandan cik" : "Tam ekran"}
          >
            {isFullscreen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 8 14 8 18" />
                <polyline points="20 10 16 10 16 6" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* Episode sidebar for TV */}
        {mediaType === "tv" && showEpisodes && (
          <div className="episode-sidebar">
            <div className="episode-sidebar__header">
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
            <div className="episode-sidebar__list">
              {episodes.map((ep) => (
                <button
                  key={ep.episode_number}
                  className={`episode-sidebar__item ${selectedSeason === (Number(season) || 1) && ep.episode_number === currentEp ? "episode-sidebar__item--active" : ""}`}
                  onClick={() => navigateEpisode(selectedSeason, ep.episode_number)}
                >
                  <div className="episode-sidebar__thumb">
                    {ep.still_path ? (
                      <Image
                        src={`${TMDB_IMG}${ep.still_path}`}
                        alt={ep.name || ""}
                        width={160}
                        height={90}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div className="episode-sidebar__thumb-placeholder">
                        <span>{ep.episode_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="episode-sidebar__info">
                    <span className="episode-sidebar__ep-num">B{ep.episode_number}</span>
                    <span className="episode-sidebar__ep-title">{ep.name || `Bolum ${ep.episode_number}`}</span>
                    {ep.overview && (
                      <p className="episode-sidebar__ep-overview">{ep.overview}</p>
                    )}
                  </div>
                </button>
              ))}
              {episodes.length === 0 && (
                <p className="episode-sidebar__empty">Bolum bilgisi bulunamadi.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="player-loading">Oynatici yukleniyor...</div>}>
      <Player />
    </Suspense>
  );
}
