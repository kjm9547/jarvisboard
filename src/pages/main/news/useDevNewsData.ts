import { useEffect, useState } from "react";
import { supabase } from "@/service/supabase";

export interface DevNewsItem {
  id: string;
  source: "bigtech" | "github";
  company?: string;
  title: string;
  url: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  author?: string;
  stars?: number;
  forks?: number;
  language?: string;
  createdAt: number;
}

interface BigTechRow {
  id: number;
  company: string;
  company_name: string;
  title: string;
  url: string;
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  author: string | null;
  published_at: string;
}

interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
}

const GH_BASE = "https://api.github.com";

async function fetchBigTechNews(): Promise<DevNewsItem[]> {
  const { data } = await supabase
    .from("bigtech_news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(60);

  return (data ?? []).map((row: BigTechRow): DevNewsItem => ({
    id: `bigtech-${row.id}`,
    source: "bigtech",
    company: row.company,
    title: row.title,
    url: row.url,
    description: row.description ?? undefined,
    content: row.content ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    author: row.author ?? undefined,
    createdAt: new Date(row.published_at).getTime(),
  }));
}

async function fetchGitHubTrending(count = 12): Promise<DevNewsItem[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const dateStr = since.toISOString().slice(0, 10);

  const data: { items?: GitHubRepo[] } = await fetch(
    `${GH_BASE}/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=${count}`,
  ).then((r) => r.json());

  return (data.items ?? []).map((repo): DevNewsItem => ({
    id: `gh-${repo.id}`,
    source: "github",
    title: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? undefined,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language ?? undefined,
    createdAt: new Date(repo.created_at).getTime(),
  }));
}

export const useDevNewsData = () => {
  const [techItems, setTechItems] = useState<DevNewsItem[]>([]);
  const [ghItems, setGhItems] = useState<DevNewsItem[]>([]);
  const [isLoadingTech, setIsLoadingTech] = useState(true);
  const [isLoadingGH, setIsLoadingGH] = useState(true);

  useEffect(() => {
    setIsLoadingTech(true);
    fetchBigTechNews()
      .then(setTechItems)
      .catch(() => setTechItems([]))
      .finally(() => setIsLoadingTech(false));

    setIsLoadingGH(true);
    fetchGitHubTrending(12)
      .then(setGhItems)
      .catch(() => setGhItems([]))
      .finally(() => setIsLoadingGH(false));
  }, []);

  return { techItems, ghItems, isLoadingTech, isLoadingGH };
};
