import { useState } from "react";

export interface TravelPeriod {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

const PERIODS_KEY = "travel_periods";
const TAGS_KEY = "travel_tags";

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const useTravelPeriods = () => {
  const [periods, setPeriods] = useState<TravelPeriod[]>(() =>
    loadStorage<TravelPeriod[]>(PERIODS_KEY, [])
  );
  const [tags, setTags] = useState<Record<string, string>>(() =>
    loadStorage<Record<string, string>>(TAGS_KEY, {})
  );

  const savePeriods = (next: TravelPeriod[]) => {
    setPeriods(next);
    localStorage.setItem(PERIODS_KEY, JSON.stringify(next));
  };

  const saveTags = (next: Record<string, string>) => {
    setTags(next);
    localStorage.setItem(TAGS_KEY, JSON.stringify(next));
  };

  const addPeriod = (name: string, startDate: string, endDate: string) => {
    savePeriods([
      ...periods,
      { id: crypto.randomUUID(), name: name.trim() || "여행", startDate, endDate },
    ]);
  };

  const removePeriod = (id: string) => {
    savePeriods(periods.filter((p) => p.id !== id));
    const next = { ...tags };
    Object.keys(next).forEach((txId) => {
      if (next[txId] === id) delete next[txId];
    });
    saveTags(next);
  };

  const tagTransactions = (txIds: string[], periodId: string) => {
    const next = { ...tags };
    txIds.forEach((id) => { next[id] = periodId; });
    saveTags(next);
  };

  const untagTransactions = (txIds: string[]) => {
    const next = { ...tags };
    txIds.forEach((id) => { delete next[id]; });
    saveTags(next);
  };

  const getTaggedPeriod = (txId: string): TravelPeriod | undefined =>
    periods.find((p) => p.id === tags[txId]);

  // Date range helper for UI filtering only (not for expense calculation)
  const getDateRangePeriod = (dateStr: string): TravelPeriod | undefined => {
    const d = dateStr.slice(0, 10);
    return periods.find((p) => d >= p.startDate && d <= p.endDate);
  };

  return {
    periods,
    tags,
    addPeriod,
    removePeriod,
    tagTransactions,
    untagTransactions,
    getTaggedPeriod,
    getDateRangePeriod,
  };
};
