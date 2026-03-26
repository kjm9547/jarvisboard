import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/hooks/useSocket";
import { useStockData } from "@/hooks/useStockData";
import { useEffect } from "react";

export const HoldingStockListCard = () => {
  const { symbols, stockChartData } = useStockData();
  const { socketInitialize, socketInstance } = useSocket();
  useEffect(() => {
    socketInitialize();
  }, []);

  return (
    <Card className="min-w-[220px] flex-1 min-h-[410px] rounded-xl backdrop-blur-sm border-none shadow-none bg-white/5 border-0 ring-0 shadow-none">
      <CardHeader>
        <CardTitle>내 포트폴리오</CardTitle>
      </CardHeader>
      <CardContent>
        {symbols.map((symbol) => (
          <div key={symbol} className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">{symbol}</span>
            <span className="text-sm text-green-400">+0.00%</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
