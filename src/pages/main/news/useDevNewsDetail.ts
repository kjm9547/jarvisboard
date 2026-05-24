import { useEffect, useState } from "react";
import type { DevNewsItem } from "./useDevNewsData";

export interface DevNewsDetail {
  readme?: string;
}

async function fetchGitHubReadme(fullName: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) throw new Error("No README");
  const data: { content: string } = await res.json();
  return atob(data.content.replace(/\n/g, ""));
}

export const useDevNewsDetail = (item: DevNewsItem | null) => {
  const [detail, setDetail] = useState<DevNewsDetail>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item || item.source !== "github") {
      setDetail({});
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDetail({});

    fetchGitHubReadme(item.title)
      .then((readme) => setDetail({ readme }))
      .catch(() => setError("README를 불러올 수 없습니다"))
      .finally(() => setIsLoading(false));
  }, [item?.id]);

  return { detail, isLoading, error };
};
