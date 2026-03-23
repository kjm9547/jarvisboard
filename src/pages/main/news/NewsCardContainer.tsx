import { useEffect, useState } from "react";
import { supabase } from "@/service/superbase";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  useEffect(() => {
    getTodayHotNewsTop5();
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <header className="mb-12 border-b pb-6">
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
      </header>

      {/* 2. 카드 그리드 레이아웃 (반응형) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {news.map((item) => (
          // shadcn/ui Card 컴포넌트로 개별 뉴스 감싸기
          <Card
            key={item.id}
            className="flex flex-col justify-between overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 bg-white"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                {/* 요약 생성 날짜 표시 */}
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {new Date(item.created_at).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {/* (선택) '새로운' 뉴스 배지 */}
                <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0.5">
                  NEW
                </Badge>
              </div>

              {/* 카드 제목: 뉴스 제목 매핑 */}
              <CardTitle className="mt-2.5 text-xl font-bold leading-tight line-clamp-2 hover:text-indigo-700 transition-colors">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </CardTitle>

              {/* (선택) 간략한 출처 설명 */}
              <CardDescription className="text-xs text-slate-400">
                출처: 구글 뉴스 (AI 요약)
              </CardDescription>
            </CardHeader>

            {/* 카드 본문: AI 요약 내용 매핑 */}
            <CardContent className="pb-5">
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                {item.summary}
              </p>
            </CardContent>

            {/* 카드 푸터: 원문 링크 버튼 */}
            <CardFooter className="pt-0 border-t mt-auto bg-slate-50/50">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-sm font-semibold text-indigo-700 hover:text-indigo-600 hover:underline pt-4 pb-1"
              >
                원본 기사 읽기 <span className="ml-1">→</span>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
