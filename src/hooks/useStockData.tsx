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
export const useStockData = () => {
  const symbols = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA"];
  const [stockChartData, setStockChartData] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);

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

  const fetchCurrentPrices = async (symbols: string[]) => {
    const apiKey = import.meta.env.VITE_MASSIVE_API_KEY;

    // 쉼표로 구분된 종목 리스트 생성 (예: "AAPL,NVDA,TSLA")
    const tickerList = symbols.join(",");
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickerList}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      // 필요한 데이터만 정리 (시가: open, 현재가: lastTrade.p 등)
      return data.tickers.map((ticker: any) => ({
        symbol: ticker.ticker,
        open: ticker.day.o, // 오늘 시가
        current: ticker.lastTrade.p, // 현재 실시간 가격
        high: ticker.day.h, // 오늘 고가
        low: ticker.day.l, // 오늘 저가
        change: ticker.todaysChangePerc.toFixed(2), // 전일 대비 변동률(%)
      }));
    }
    return [];
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedSymbol]);
  return {
    symbols,
    stockChartData,
    selectedSymbol,
    handleSelect,
    fetchChartData,
  };
};
