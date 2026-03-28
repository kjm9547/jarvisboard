import { useEffect, useState } from "react";
import { supabase } from "@/service/superbase";
import { Badge } from "@/components/ui/badge";
import { TodayNewsListCard } from "./TodayNewsListCard";
interface News {
  id: number;
  title: string;
  summary: string;
  link: string;
  created_at: string;
}
export const NewsCardContainer = () => {
  const [news, setNews] = useState<News[]>([]);
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
  // React 컴포넌트 내에서 호출

  useEffect(() => {
    getTodayHotNewsTop5();
  }, []);
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

      {/* 2. 카드 그리드 레이아웃 (반응형) */}
      <TodayNewsListCard news={news} />
    </div>
  );
};
