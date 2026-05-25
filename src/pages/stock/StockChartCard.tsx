import { StockChart } from "./StockChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  symbols: string[];
  stockChartData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: string;
  }[];
  selectedSymbol: string;
  handleSelect: (symbol: string) => void;
  prices?: Record<string, number>;
}

export const StockChartCard = ({
  symbols,
  stockChartData,
  selectedSymbol,
  handleSelect,
  prices,
}: Props) => {
  const currentPrice = prices?.[selectedSymbol];

  return (
    <Card className="w-full ring-0 rounded-xl bg-white/5 backdrop-blur-lg border-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* 심볼 탭 */}
          <div className="flex flex-wrap gap-2">
            {symbols.map((symbol) => {
              const isSelected = selectedSymbol === symbol;
              return (
                <Badge
                  key={symbol}
                  variant={isSelected ? "default" : "secondary"}
                  className={cn(
                    "px-3 py-1.5 cursor-pointer text-sm font-semibold transition-all duration-150 flex items-center gap-1.5",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:opacity-90"
                  )}
                  onClick={() => handleSelect(symbol)}
                >
                  {isSelected && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
                  )}
                  {symbol}
                </Badge>
              );
            })}
          </div>

          {/* 현재가 표시 */}
          {currentPrice && currentPrice > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">현재가</span>
              <span className="text-sm font-bold text-foreground font-mono">
                ${currentPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-100">
        {stockChartData.length === 0 ? (
          /* 스켈레톤 로딩 */
          <div className="h-full flex flex-col gap-3 pt-2">
            <div className="flex-1 relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-muted/20 animate-pulse rounded-xl" />
              {/* 가짜 차트 선 */}
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <polyline
                  points="0,70 80,55 160,65 240,40 320,50 400,35 480,45 560,30 640,40 720,25 800,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground"
                />
              </svg>
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 flex-1 rounded bg-muted/30 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <StockChart symbol={selectedSymbol} chartData={stockChartData} />
        )}
      </CardContent>
    </Card>
  );
};
