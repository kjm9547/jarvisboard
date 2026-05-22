import { useState, useEffect } from "react";

export interface ChannelStats {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  url: string;
}

const YT = "https://www.googleapis.com/youtube/v3";

const ytFetch = async (path: string, token: string) => {
  const res = await fetch(`${YT}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
};

export const useYouTubeChannel = (token: string | null) => {
  const [channel, setChannel] = useState<ChannelStats | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setChannel(null); setVideos([]); return; }
    fetchAll(token);
  }, [token]);

  const fetchAll = async (tk: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. 채널 기본 정보
      const chData = await ytFetch(
        "/channels?part=statistics,snippet&mine=true",
        tk
      );
      const ch = chData.items?.[0];
      if (!ch) throw new Error("채널 정보를 찾을 수 없습니다");

      setChannel({
        id: ch.id,
        title: ch.snippet.title,
        description: ch.snippet.description,
        thumbnail: ch.snippet.thumbnails?.medium?.url ?? "",
        subscriberCount: Number(ch.statistics.subscriberCount),
        viewCount: Number(ch.statistics.viewCount),
        videoCount: Number(ch.statistics.videoCount),
      });

      // 2. 최근 영상 목록 (최대 12개)
      const searchData = await ytFetch(
        `/search?part=snippet&forMine=true&type=video&order=date&maxResults=12`,
        tk
      );
      const videoIds = searchData.items?.map((i: { id: { videoId: string } }) => i.id.videoId).join(",");
      if (!videoIds) return;

      // 3. 각 영상 상세 통계
      const videoData = await ytFetch(
        `/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
        tk
      );
      setVideos(
        videoData.items?.map((v: {
          id: string;
          snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string };
          statistics: { viewCount: string; likeCount: string; commentCount: string };
          contentDetails: { duration: string };
        }) => ({
          id: v.id,
          title: v.snippet.title,
          thumbnail: v.snippet.thumbnails?.medium?.url ?? "",
          publishedAt: v.snippet.publishedAt,
          viewCount: Number(v.statistics.viewCount ?? 0),
          likeCount: Number(v.statistics.likeCount ?? 0),
          commentCount: Number(v.statistics.commentCount ?? 0),
          duration: parseDuration(v.contentDetails.duration),
          url: `https://www.youtube.com/watch?v=${v.id}`,
        })) ?? []
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return { channel, videos, loading, error, refetch: () => token && fetchAll(token) };
};

// ISO 8601 duration → "m:ss"
const parseDuration = (iso: string): string => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = Number(match[1] ?? 0);
  const m = Number(match[2] ?? 0);
  const s = Number(match[3] ?? 0);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};
