"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "continue_watching";
const MAX_ITEMS = 20;

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function useContinueWatching() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const addItem = useCallback((payload) => {
    // payload: { id, type, title, poster_path, backdrop_path, season?, episode? }
    const current = readStorage();
    // Remove existing entry for same id+type
    const filtered = current.filter(
      (item) => !(item.id === payload.id && item.type === payload.type)
    );
    // Add to front with timestamp
    const updated = [{ ...payload, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    writeStorage(updated);
    setItems(updated);
  }, []);

  const removeItem = useCallback((id, type) => {
    const current = readStorage();
    const updated = current.filter((item) => !(item.id === id && item.type === type));
    writeStorage(updated);
    setItems(updated);
  }, []);

  const getLatest = useCallback(() => {
    const current = readStorage();
    return current.length > 0 ? current[0] : null;
  }, []);

  return { items, addItem, removeItem, getLatest };
}
