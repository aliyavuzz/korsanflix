"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

/**
 * Netflix tarzı yatay kaydırmalı film/dizi sırası.
 * Sol/sağ ok butonlarıyla kaydırılır.
 */
export default function ContentRow({ title, type, genreId, onCardClick }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    let url = `/api/movies?type=${type}`;
    if (type === "genre" && genreId) {
      url = `/api/movies?type=genre&genre_id=${genreId}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems((data.results || []).filter((m) => m.poster_path)))
      .catch(() => {});
  }, [type, genreId]);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="content-row">
      <h2 className="content-row__title">{title}</h2>
      <div className="content-row__wrapper">
        <button className="content-row__arrow content-row__arrow--left" onClick={() => scroll("left")} aria-label="Sola kaydır">
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
        <button className="content-row__arrow content-row__arrow--right" onClick={() => scroll("right")} aria-label="Sağa kaydır">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>
  );
}
