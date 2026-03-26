import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useEffect } from "react";

type Props = {
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
};
export const HoldingStockListCard = ({
  symbols,
  prices,
  aiAnalysisReports,
}: Props) => {
  return (
    <Card className="min-w-[320px] flex-1 h-full rounded-2xl backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl ring-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-lg font-bold text-white/90">
            내 포트폴리오
          </CardTitle>
          <Badge
            variant="outline"
            className="border-red-500 text-red-500 font-mono text-[10px]"
          >
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* 헤더 섹션: 레이블 */}
        <div className="grid grid-cols-4  border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2">
          <span>종목</span>
          <span className="text-right">AI 구매가</span>
          <span className="text-right">현재가</span>
          <span className="text-right">수익률</span>
        </div>

        <ScrollArea className="h-[450px] pr-2">
          <div className="space-y-1">
            {symbols.map((symbol) => {
              const currentPrice = prices ? prices[symbol] : 0;
              const analysis = aiAnalysisReports?.find(
                (report) => report.symbol === symbol
              );

              if (!analysis || !currentPrice) return null;

              const buyPrice = analysis.current_price || 0;
              const diff = currentPrice - buyPrice;
              const percentageChange =
                buyPrice !== 0 ? ((diff / buyPrice) * 100).toFixed(2) : "0.00";
              const isPositive = parseFloat(percentageChange) > 0;
              const isZero = parseFloat(percentageChange) === 0;

              return (
                <div
                  key={symbol}
                  className="grid grid-cols-4 items-center py-3 px-2 rounded-xl transition-all hover:bg-white/10 cursor-pointer group"
                >
                  {/* 종목명 */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {symbol}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">
                      Stock
                    </span>
                  </div>

                  {/* 구매가 */}
                  <span className="text-sm text-right font-mono text-zinc-400">
                    ${buyPrice.toLocaleString()}
                  </span>

                  {/* 현재가 */}
                  <span className="text-sm text-right font-mono font-bold text-white">
                    ${currentPrice.toLocaleString()}
                  </span>

                  {/* 증감률 */}
                  <div
                    className={`flex items-center justify-end gap-1 text-sm font-bold ${
                      isZero
                        ? "text-zinc-500"
                        : isPositive
                          ? "text-emerald-400"
                          : "text-rose-400"
                    }`}
                  >
                    {isZero ? (
                      <Minus size={12} />
                    ) : isPositive ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span className="font-mono">
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
