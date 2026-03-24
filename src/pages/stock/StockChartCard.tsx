import { useEffect, useState } from "react";
import { StockChart } from "./StockChart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

export const StockChartCard = () => {
  const symbols = ["NVDA", "AAPL", "TSLA", "META"];
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);

  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };
  const [stockChartData, setStockChartData] = useState<any[]>([]);
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
  useEffect(() => {
    fetchChartData();
  }, [selectedSymbol]);

  return (
    <div className="w-full h-[400px]  rounded-xl shadow-md bg-white/5 backdrop-blur-lg">
      {symbols.map((symbol) => (
        <Badge
          key={symbol}
          variant={selectedSymbol === symbol ? "default" : "secondary"}
          className={cn(
            "px-4 py-1.5 cursor-pointer text-sm font-semibold transition-all hover:opacity-80",
            selectedSymbol === symbol
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
          onClick={() => handleSelect(symbol)}
        >
          {symbol}
        </Badge>
      ))}
      {stockChartData.length === 0 ? (
        <div>데이터 불러 오는중</div>
      ) : (
        <StockChart symbol={selectedSymbol} chartData={stockChartData} />
      )}
    </div>
  );
};
