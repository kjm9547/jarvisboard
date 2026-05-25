import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  symbols: string[];
  prices?: Record<string, number>;
  aiAnalysisReports?: {
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
  }[];
}

const symbolColors: Record<string, { bg: string; text: string }> = {
  AAPL: { bg: "bg-blue-500/15", text: "text-blue-400" },
  NVDA: { bg: "bg-green-500/15", text: "text-green-400" },
  META: { bg: "bg-indigo-500/15", text: "text-indigo-400" },
  TSLA: { bg: "bg-red-500/15", text: "text-red-400" },
};

const getSymbolColors = (symbol: string) =>
  symbolColors[symbol] ?? { bg: "bg-muted/30", text: "text-muted-foreground" };

export const HoldingStockListCard = ({
  symbols,
  prices,
  aiAnalysisReports,
}: Props) => {
  const hasData = symbols.some(
    (s) => prices?.[s] && aiAnalysisReports?.find((r) => r.symbol === s)
  );

  return (
    <Card className="min-w-80 flex-1 h-full rounded-2xl backdrop-blur-md bg-white/5 border-border ring-0 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-bold text-foreground">
            내 포트폴리오
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <Badge
              variant="outline"
              className="border-red-500/50 text-red-500 font-mono text-[10px] py-0"
            >
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-3">
          <span>종목</span>
          <span className="text-right">AI 구매가</span>
          <span className="text-right">현재가</span>
          <span className="text-right">수익률</span>
        </div>

        <ScrollArea className="h-112.5 pr-2">
          <div className="space-y-0.5 pt-1">
            {!hasData
              ? /* 스켈레톤 로딩 */
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 items-center py-3 px-2 gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted/50 animate-pulse" />
                      <div className="h-4 w-12 rounded bg-muted/50 animate-pulse" />
                    </div>
                    <div className="h-4 w-16 rounded bg-muted/50 animate-pulse ml-auto" />
                    <div className="h-4 w-16 rounded bg-muted/50 animate-pulse ml-auto" />
                    <div className="h-5 w-14 rounded-full bg-muted/50 animate-pulse ml-auto" />
                  </div>
                ))
              : symbols.map((symbol) => {
                  const currentPrice = prices ? prices[symbol] : 0;
                  const analysis = aiAnalysisReports?.find(
                    (report) => report.symbol === symbol
                  );

                  if (!analysis || !currentPrice) return null;

                  const buyPrice = analysis.current_price || 0;
                  const diff = currentPrice - buyPrice;
                  const percentageChange =
                    buyPrice !== 0
                      ? ((diff / buyPrice) * 100).toFixed(2)
                      : "0.00";
                  const isPositive = parseFloat(percentageChange) > 0;
                  const isZero = parseFloat(percentageChange) === 0;
                  const { bg, text } = getSymbolColors(symbol);

                  return (
                    <div
                      key={symbol}
                      className={cn(
                        "grid grid-cols-4 items-center py-3 px-2 rounded-xl",
                        "transition-all duration-150 cursor-pointer group",
                        "border-l-2 border-transparent hover:border-primary hover:bg-accent/20"
                      )}
                    >
                      {/* 종목명 + 아바타 */}
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            bg,
                            text
                          )}
                        >
                          {symbol[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors truncate">
                            {symbol}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Stock
                          </span>
                        </div>
                      </div>

                      {/* AI 구매가 */}
                      <span className="text-sm text-right font-mono text-muted-foreground">
                        ${buyPrice.toLocaleString()}
                      </span>

                      {/* 현재가 */}
                      <span className="text-sm text-right font-mono font-bold text-foreground">
                        ${currentPrice.toLocaleString()}
                      </span>

                      {/* 수익률 배지 */}
                      <div className="flex justify-end">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 text-xs font-bold font-mono rounded-full px-2 py-0.5",
                            isZero
                              ? "bg-muted/30 text-muted-foreground"
                              : isPositive
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-red-500/10 text-red-500"
                          )}
                        >
                          {isZero ? (
                            <Minus size={10} />
                          ) : isPositive ? (
                            <ArrowUpRight size={11} />
                          ) : (
                            <ArrowDownRight size={11} />
                          )}
                          {Math.abs(parseFloat(percentageChange))}%
                        </span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
