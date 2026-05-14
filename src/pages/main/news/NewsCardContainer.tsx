import { useEffect, useState } from "react";
import { supabase } from "@/service/superbase";
import { Badge } from "@/components/ui/badge";
import { TodayNewsListCard } from "./TodayNewsListCard";
import parse from "html-react-parser";
interface News {
  id: number;
  title: string;
  summary: string;
  link: string;
  description: string;
  created_at: string;
}
export const NewsCardContainer = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const getTodayHotNewsTop5 = async () => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(24, 0, 0, 0));
    const key = import.meta.env;
    console.log(key);
    const { data, error } = await supabase
      .from("news_summaries")
      .select("*")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    console.log("data", data);
    if (data) setNews(data as News[]);
  };
  const handleSelcetedNews = (newsItem: News) => {
    setSelectedNews(newsItem);
  };
  // React 컴포넌트 내에서 호출

  useEffect(() => {
    getTodayHotNewsTop5();
  }, []);
  useEffect(() => {
    console.log("selectedNews", selectedNews);
  }, [selectedNews]);
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="mb-12 border-b pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-black">AI News 관제 센터</h1>
          {/* (선택) 상태 배지 추가 */}
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-200 bg-emerald-50"
          >
            실시간 작동 중
          </Badge>
        </div>
        <p className="mt-2 text-slate-600">
          맥 미니 서버가 9시마다 요약하는 오늘의 핵심 뉴스
        </p>
      </div>
      <div>
        <div>
          {selectedNews ? (
            <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-2">{selectedNews.title}</h2>
              <p className="text-gray-700 mb-4 h-800px whitespace-pre-wrap">
                {selectedNews.summary}
              </p>
              {parse(selectedNews.description)}
              <a
                href={selectedNews.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              ></a>
            </div>
          ) : (
            <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm text-center text-gray-500">
              뉴스를 선택하면 요약된 내용을 볼 수 있습니다.
            </div>
          )}
        </div>
        <TodayNewsListCard
          news={news}
          handleSelcetedNews={handleSelcetedNews}
        />
      </div>
    </div>
  );
};
