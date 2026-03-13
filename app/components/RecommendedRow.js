"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

export default function RecommendedRow({ onCardClick }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    // Get the most recently watched item
    let latest = null;
    try {
      const raw = localStorage.getItem("continue_watching");
      if (raw) {
        const list = JSON.parse(raw);
        if (list.length > 0) latest = list[0];
      }
    } catch {}

    if (!latest) {
      // Fallback to trending
      fetch("/api/movies?type=trending")
        .then((r) => r.json())
        .then((data) => setItems((data.results || []).filter((m) => m.poster_path).slice(0, 20)))
        .catch(() => {});
      return;
    }

    // Fetch recommendations based on latest watched
    fetch(`/api/detail?id=${latest.id}&type=${latest.type}&recommendations=1`)
      .then((r) => r.json())
      .then((data) => {
        const results = (data.results || []).filter((m) => m.poster_path).slice(0, 20);
        if (results.length > 0) {
          setItems(results);
        } else {
          // Fallback to trending if no recommendations
          fetch("/api/movies?type=trending")
            .then((r) => r.json())
            .then((d) => setItems((d.results || []).filter((m) => m.poster_path).slice(0, 20)))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="content-row">
      <h2 className="content-row__title">Sizin Icin Onerililer</h2>
      <div className="content-row__wrapper">
        <button className="content-row__arrow content-row__arrow--left" onClick={() => scroll("left")} aria-label="Sola kaydir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="content-row__slider" ref={rowRef}>
          {items.map((item) => (
            <button
              key={item.id}
              className="content-row__card"
              onClick={() => onCardClick(item)}
              title={item.title || item.name}
            >
              <Image
                src={`${TMDB_IMG}${item.poster_path}`}
                alt={item.title || item.name || ""}
                width={170}
                height={255}
                className="content-row__poster"
              />
              <span className="content-row__card-title">{item.title || item.name}</span>
            </button>
          ))}
        </div>
        <button className="content-row__arrow content-row__arrow--right" onClick={() => scroll("right")} aria-label="Saga kaydir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>
  );
}
