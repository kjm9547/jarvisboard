import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/service/superbase";
import type { News } from "./types";

export const useNewsData = () => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("news_summaries")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setNews(data as News[]);
      setIsLoading(false);
    };
    fetchNews();
  }, []);

  const dateGroups = useMemo(() => {
    const groups: Record<string, News[]> = {};
    news.forEach((item) => {
      const key = item.created_at.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [news]);

  const sortedDates = useMemo(
    () => Object.keys(dateGroups).sort((a, b) => b.localeCompare(a)),
    [dateGroups],
  );

  return { news, isLoading, dateGroups, sortedDates };
};
