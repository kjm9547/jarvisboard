import { StockChart } from "./StockChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type props = {
  symbols: string[];
  stockChartData: any[];
  selectedSymbol: string;
  handleSelect: (symbol: string) => void;
};
export const StockChartCard = ({
  symbols,
  stockChartData,
  selectedSymbol,
  handleSelect,
}: props) => {
  return (
    <Card className="w-full ring-0 rounded-xl bg-white/5 backdrop-blur-lg border-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2">
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
        </div>
      </CardHeader>
      <CardContent className="h-100">
        {stockChartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            데이터 불러오는 중...
          </div>
        ) : (
          <StockChart symbol={selectedSymbol} chartData={stockChartData} />
        )}
      </CardContent>
    </Card>
  );
};
