import { supabase } from "@/service/superbase";
import { useEffect, useState } from "react";

interface StockFetchResponse {
  v: string;
  vw: number;
  o: number;
  c: number;
  h: number;
  l: number;
  t: number;
  n: number;
}
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
export const useStockData = () => {
  const symbols = ["AAPL", "NVDA", "META", "TSLA"];
  const [stockChartData, setStockChartData] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [aiAnalysisReports, setAiAnalysisReports] = useState<analysisReports[]>(
    []
  );
  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };
  const fetchChartData = async () => {
    const apiKey = import.meta.env.VITE_MASSIVE_API_KEY;
    const url = `https://api.polygon.io/v2/aggs/ticker/${selectedSymbol}/range/1/minute/2026-03-23/2026-03-24?adjusted=true&sort=asc&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // 차트 라이브러리(예: Recharts) 형식으로 변환
    const chartData = data.results.map((bar: StockFetchResponse) => ({
      time: new Date(bar.t).toLocaleTimeString(), // 타임스탬프를 시간으로 변환
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c, // 종가 (차트의 메인 선)
      volume: bar.v,
    }));
    setStockChartData(chartData);
  };
  const getAnalysisReports = async () => {
    const today = new Date();
    const start = new Date("2026-03-23");
    const end = new Date("2026-03-24");

    const targetDate = "2026-03-23";

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const nextDateStr = nextDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .gte("created_at", targetDate)
      .lt("created_at", nextDateStr)
      .order("created_at", { ascending: false });
    if (data) setAiAnalysisReports(data as analysisReports[]);
  };
  useEffect(() => {
    console.log("qqwq");
    if (selectedSymbol) fetchChartData();
  }, [selectedSymbol]);
  return {
    symbols,
    stockChartData,
    selectedSymbol,
    aiAnalysisReports,
    handleSelect,
    fetchChartData,
    getAnalysisReports,
  };
};
