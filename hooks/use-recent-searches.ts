"use client";

import { useCallback, useEffect, useState } from "react";

import {
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
} from "@/lib/validations/search";

export type RecentSearchEntry = {
  id: string;
  label: string;
  query: string;
  timestamp: number;
};

function readRecentSearches(): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearchEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  const addRecentSearch = useCallback((label: string, query: string) => {
    if (!label.trim() || !query.trim()) return;

    setRecentSearches((current) => {
      const next = [
        {
          id: `${Date.now()}-${label}`,
          label: label.trim(),
          query: query.trim(),
          timestamp: Date.now(),
        },
        ...current.filter((entry) => entry.query !== query.trim()),
      ].slice(0, MAX_RECENT_SEARCHES);

      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
