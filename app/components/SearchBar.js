"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Debounced search bar. Fires `onSearch(query)` after the user stops
 * typing for 400ms, or immediately on Enter/button click.
 */
export default function SearchBar({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const timerRef = useRef(null);

  // Debounced live search
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(value.trim());
      }, 400);
    },
    [onSearch]
  );

  // Immediate search on Enter
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter") {
        clearTimeout(timerRef.current);
        onSearch(query.trim());
      }
    },
    [onSearch, query]
  );

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="search-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder="Film veya dizi ara..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKey}
        autoFocus
      />
      <button
        className="search-btn"
        onClick={() => onSearch(query.trim())}
        aria-label="Ara"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
