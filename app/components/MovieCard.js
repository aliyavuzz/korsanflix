"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' fill='%23181818'%3E%3Crect width='500' height='750'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * A single movie/TV poster card.
 * Clicking navigates to /watch?id=TMDB_ID&type=movie|tv
 */
export default function MovieCard({ item }) {
  const router = useRouter();

  const title = item.title || item.name || "Untitled";
  const mediaType = item.media_type || "movie";
  const posterSrc = item.poster_path
    ? `${TMDB_IMG}${item.poster_path}`
    : null;

  const handleClick = () => {
    router.push(`/watch?id=${item.id}&type=${mediaType}`);
  };

  return (
    <button className="movie-card" onClick={handleClick} title={title}>
      <div className="poster-wrapper">
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt={title}
            width={250}
            height={375}
            className="poster-img"
            placeholder="blur"
            blurDataURL={PLACEHOLDER}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={PLACEHOLDER} alt={title} className="poster-img" />
        )}
      </div>
      <span className="movie-title">{title}</span>
    </button>
  );
}
