import { useEffect, useState } from "react";
import { StockChart } from "./StockChart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStockData } from "@/hooks/useStockData";

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
  const { symbols, handleSelect, stockChartData, selectedSymbol } =
    useStockData();

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
