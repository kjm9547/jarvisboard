import { supabase } from "@/service/superbase";
import { AlertCircle, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { StockChartCard } from "./StockChartCard";

interface analysisReports {
  id: string;
  created_at: string;
  symbol: string;
  score: number;
  target_price: number;
  stop_loss: number;
  period: string;
  reason: string;
  decision: string;
  processed_at: string;
  current_price: number;
}

export const StockDashboard = () => {
  const [analysisReports, setAnalysisReports] = useState<analysisReports[]>([]);

  const getAnalysisReports = async () => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(24, 0, 0, 0));

    const { data, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false });
    console.log("data", data);
    if (data) setAnalysisReports(data as analysisReports[]);
  };
  useEffect(() => {
    getAnalysisReports();
  }, []);

  return (
    <div className="px-5">
      <div className="h-[500px] pt-10">
        실시간 차트
        <StockChartCard />
      </div>
      <div className="w-[50%]">
        <p>AI 분석 리스트</p>
        {analysisReports.map((data) => {
          const isBuy = data.decision === "BUY";
          return (
            <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10">
              {/* 상단: 티커 및 스코어 */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white">
                    {data.symbol}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      보유 기간: {data.period}
                    </span>
                  </div>
                </div>
                <div className={`flex flex-col items-end`}>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${isBuy ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    AI Signal
                  </span>
                  <span
                    className={`text-4xl font-black ${isBuy ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {data.decision}
                  </span>
                </div>
              </div>

              {/* 중앙: AI 스코어 바 */}
              <div className="my-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-300">AI 신뢰도</span>
                  <span className="font-mono font-bold text-white">
                    {data.score}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isBuy ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${data.score}%` }}
                  />
                </div>
              </div>

              {/* 하단: 분석 이유 */}
              <div className="mb-6 rounded-lg bg-black/20 p-3">
                <p className="text-sm leading-relaxed text-gray-300 line-clamp-3">
                  <span className="mr-1 inline-block">
                    <AlertCircle size={14} />
                  </span>
                  {data.reason}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-olive-500 /5 p-3 text-center mb-3 text-black">
                <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-emerald-400">
                  구매가
                </div>
                {data.current_price}
              </div>

              {/* 가격 정보 레이아웃 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-emerald-400">
                    <TrendingUp size={12} /> 목표가
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${data.target_price}
                  </div>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-red-400">
                    <TrendingDown size={12} /> 손절가
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${data.stop_loss}
                  </div>
                </div>
              </div>

              {/* 배경 장식 (은은한 그라데이션 광택) */}
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[80px] opacity-20 ${isBuy ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
