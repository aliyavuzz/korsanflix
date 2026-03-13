"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

export default function ContinueWatchingRow() {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("continue_watching");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleClick = (item) => {
    let url = `/watch?id=${item.id}&type=${item.type}`;
    if (item.type === "tv") {
      url += `&season=${item.season || 1}&episode=${item.episode || 1}`;
    }
    router.push(url);
  };

  if (items.length === 0) return null;

  return (
    <section className="content-row">
      <h2 className="content-row__title">Izlemeye Devam Et</h2>
      <div className="content-row__wrapper">
        <button className="content-row__arrow content-row__arrow--left" onClick={() => scroll("left")} aria-label="Sola kaydir">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="content-row__slider" ref={rowRef}>
          {items.map((item) => (
            <button
              key={`${item.id}-${item.type}`}
              className="content-row__card continue-card"
              onClick={() => handleClick(item)}
              title={item.title}
            >
              {item.poster_path ? (
                <Image
                  src={`${TMDB_IMG}${item.poster_path}`}
                  alt={item.title || ""}
                  width={170}
                  height={255}
                  className="content-row__poster"
                />
              ) : (
                <div className="content-row__poster content-row__poster--empty">
                  <span>{item.title}</span>
                </div>
              )}
              <span className="content-row__card-title">
                {item.title}
                {item.type === "tv" && item.season && item.episode
                  ? ` - S${item.season}B${item.episode}`
                  : ""}
              </span>
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
