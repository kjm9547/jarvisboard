import { useState, useEffect } from "react";

export interface AnalyticsDay {
  date: string; // YYYY-MM-DD
  views: number;
  estimatedMinutesWatched: number;
  impressions: number;
  impressionClickThroughRate: number;
}

const ANALYTICS = "https://youtubeanalytics.googleapis.com/v2/reports";

export const useYouTubeAnalytics = (token: string | null) => {
  const [data, setData] = useState<AnalyticsDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setData([]); return; }
    fetchAnalytics(token);
  }, [token]);

  const fetchAnalytics = async (tk: string) => {
    setLoading(true);
    setError(null);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 27);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const params = new URLSearchParams({
        ids: "channel==MINE",
        startDate: fmt(start),
        endDate: fmt(end),
        metrics: "views,estimatedMinutesWatched,impressions,impressionClickThroughRate",
        dimensions: "day",
        sort: "day",
      });

      const res = await fetch(`${ANALYTICS}?${params}`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (!res.ok) throw new Error(`Analytics API error: ${res.status}`);
      const json = await res.json();

      setData(
        (json.rows ?? []).map((row: [string, number, number, number, number]) => ({
          date: row[0],
          views: row[1],
          estimatedMinutesWatched: row[2],
          impressions: row[3],
          impressionClickThroughRate: Number((row[4] * 100).toFixed(1)),
        }))
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const totalViews = data.reduce((s, d) => s + d.views, 0);
  const totalWatchMinutes = data.reduce((s, d) => s + d.estimatedMinutesWatched, 0);
  const avgCTR = data.length
    ? Number((data.reduce((s, d) => s + d.impressionClickThroughRate, 0) / data.length).toFixed(1))
    : 0;

  return { data, loading, error, totalViews, totalWatchMinutes, avgCTR };
};
