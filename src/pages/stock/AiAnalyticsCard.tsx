import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  BotMessageSquare,
  Calendar,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface Props {
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

const scoreLabel = (score: number): string => {
  if (score >= 75) return "높음";
  if (score >= 50) return "보통";
  return "낮음";
};

export const AiAnalyticsCard = ({ aiAnalysisReports }: Props) => {
  const count = aiAnalysisReports?.length ?? 0;

  return (
    <Card className="h-full ring-0 rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-blue-500" />
            AI 분석 결과
          </CardTitle>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs font-mono">
              {count}개
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          AI가 분석한 결과입니다. 참고만 해주세요.
        </p>
      </CardHeader>

      <ScrollArea className="h-112.5">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground px-4">
            <BotMessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm">분석 데이터가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-4">
            {aiAnalysisReports?.map((data) => {
              const isBuy = data.decision === "BUY";
              return (
                <div
                  key={data.id}
                  className="relative overflow-hidden rounded-2xl border border-border bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  {/* 상단: 티커 및 시그널 */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-foreground">
                        {data.symbol}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {data.period}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          구매가 ${data.current_price}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${isBuy ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        AI Signal
                      </span>
                      <span
                        className={`text-2xl font-black leading-none ${isBuy ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {data.decision}
                      </span>
                    </div>
                  </div>

                  {/* AI 신뢰도 바 */}
                  <div className="mb-3">
                    <div className="mb-1.5 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">AI 신뢰도</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[10px]">
                          {scoreLabel(data.score)}
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {data.score}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isBuy ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>

                  {/* 분석 이유 */}
                  <div className="mb-3 rounded-lg bg-muted/20 p-3 border border-border/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        분석 근거
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {data.reason}
                    </p>
                  </div>

                  {/* 가격 정보 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-emerald-500">
                        <TrendingUp size={11} />
                        목표가
                      </div>
                      <div className="text-base font-bold text-foreground font-mono">
                        ${data.target_price}
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] text-red-500">
                        <TrendingDown size={11} />
                        손절가
                      </div>
                      <div className="text-base font-bold text-foreground font-mono">
                        ${data.stop_loss}
                      </div>
                    </div>
                  </div>

                  {/* 배경 장식 */}
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-15 pointer-events-none ${isBuy ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
