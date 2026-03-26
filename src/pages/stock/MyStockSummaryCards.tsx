import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Briefcase, BarChart3 } from "lucide-react";

export const MyStockSummaryCards = () => {
  const titleKey = [
    "총 투자액",
    "오늘 수익",
    "보유 종목",
    "총 수익률",
  ] as const;
  const summaryConfig = {
    "총 투자액": { icon: Wallet, color: "text-blue-500" },
    "오늘 수익": { icon: TrendingUp, color: "text-emerald-500" },
    "보유 종목": { icon: Briefcase, color: "text-amber-500" },
    "총 수익률": { icon: BarChart3, color: "text-indigo-500" },
  };
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {titleKey.map((title) => {
        const { icon: Icon, color } = summaryConfig[title];
        return (
          <Card
            className="min-w-[250px] h-[110px] rounded-xl backdrop-blur-sm border-none shadow-none bg-white/5 border-0 ring-0 shadow-none"
            key={`${title}_key`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                {title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {/* 나중에 데이터를 여기에 연결하세요 */}-
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                지난 업데이트 대비 +0.0%
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
