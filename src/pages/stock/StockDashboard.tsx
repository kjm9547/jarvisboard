import { AlertCircle, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { StockChartCard } from "./StockChartCard";
import { MyStockSummaryCards } from "./MyStockSummaryCards";
import { HoldingStockListCard } from "./HoldingStockListCard";
import { useStockData } from "@/hooks/useStockData";
import { useSocket } from "@/hooks/useSocket";
import { AiAnalysticCard } from "./AiAnalysticCard";

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

  useEffect(() => {
    socketInitialize();
    getAnalysisReports();
  }, []);

  return (
    <div className="px-5 pt-5">
      <div className="flex items-start justify-center mb-5 flex-col gap-2">
        <p className="text-xl font-bold text-amber-50 ">안녕하세요 주인님</p>
        <p>투자 현황을 가져왔습니다.</p>
      </div>
      <MyStockSummaryCards />
      <div className="flex h-auto gap-5 mb-5">
        <HoldingStockListCard
          symbols={symbols}
          prices={prices}
          aiAnalysisReports={aiAnalysisReports}
        />
        <AiAnalysticCard aiAnalysisReports={aiAnalysisReports} />
      </div>

      <div className="h[500px] pt-10">
        실시간 차트
        <StockChartCard
          symbols={symbols}
          stockChartData={stockChartData}
          selectedSymbol={selectedSymbol}
          handleSelect={handleSelect}
        />
      </div>
    </div>
  );
};
