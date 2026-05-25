import { useEffect } from "react";
import { StockChartCard } from "./StockChartCard";
import { MyStockSummaryCards } from "./MyStockSummaryCards";
import { HoldingStockListCard } from "./HoldingStockListCard";
import { useStockData } from "@/hooks/useStockData";
import { useSocket } from "@/hooks/useSocket";
import { AiAnalyticsCard } from "./AiAnalyticsCard";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp } from "lucide-react";

const isMarketOpen = (): boolean => {
  const now = new Date();
  const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const h = est.getHours();
  const m = est.getMinutes();
  const isWeekday = est.getDay() >= 1 && est.getDay() <= 5;
  return isWeekday && (h > 9 || (h === 9 && m >= 30)) && h < 16;
};

const formatDate = (): string => {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

export const StockDashboard = () => {
  const {
    aiAnalysisReports,
    symbols,
    selectedSymbol,
    stockChartData,
    handleSelect,
    getAnalysisReports,
  } = useStockData();
  const { prices, socketInitialize } = useSocket();
  const marketOpen = isMarketOpen();

  useEffect(() => {
    socketInitialize();
    getAnalysisReports();
  }, []);

  return (
    <div className="px-5 pt-5 pb-8">
      {/* 마켓 상태 바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${marketOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
            />
            <Badge
              variant="outline"
              className={`text-xs font-mono font-semibold ${
                marketOpen
                  ? "border-emerald-500/50 text-emerald-500"
                  : "border-red-500/50 text-red-500"
              }`}
            >
              NYSE {marketOpen ? "OPEN" : "CLOSED"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>실시간 데이터</span>
        </div>
      </div>

      {/* 인사말 */}
      <div className="flex items-end justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            안녕하세요 주인님
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            투자 현황을 가져왔습니다
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <MyStockSummaryCards />

      {/* 포트폴리오 현황 섹션 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          포트폴리오 현황
        </h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-5 mb-6">
        <HoldingStockListCard
          symbols={symbols}
          prices={prices}
          aiAnalysisReports={aiAnalysisReports}
        />
        <AiAnalyticsCard aiAnalysisReports={aiAnalysisReports} />
      </div>

      {/* 실시간 차트 섹션 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          실시간 차트
        </h3>
        {selectedSymbol && (
          <Badge variant="secondary" className="text-xs font-mono">
            {selectedSymbol}
          </Badge>
        )}
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="mb-5">
        <StockChartCard
          symbols={symbols}
          stockChartData={stockChartData}
          selectedSymbol={selectedSymbol}
          handleSelect={handleSelect}
          prices={prices}
        />
      </div>
    </div>
  );
};
