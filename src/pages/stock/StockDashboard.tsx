import { useEffect } from "react";
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
        <h2 className="text-xl font-bold text-foreground">안녕하세요 주인님</h2>
        <p className="text-sm text-muted-foreground">투자 현황을 가져왔습니다.</p>
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

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-semibold text-foreground">실시간 차트</h3>
        </div>
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
