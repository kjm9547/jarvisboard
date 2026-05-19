import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Briefcase, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryKey = "총 투자액" | "오늘 수익" | "보유 종목" | "총 수익률";

const summaryConfig: Record<
  SummaryKey,
  {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    tint: string;
    bar: string;
  }
> = {
  "총 투자액": {
    icon: Wallet,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    tint: "bg-blue-500/5",
    bar: "from-blue-500/40 via-blue-500/10 to-transparent",
  },
  "오늘 수익": {
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    tint: "bg-emerald-500/5",
    bar: "from-emerald-500/40 via-emerald-500/10 to-transparent",
  },
  "보유 종목": {
    icon: Briefcase,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    tint: "bg-amber-500/5",
    bar: "from-amber-500/40 via-amber-500/10 to-transparent",
  },
  "총 수익률": {
    icon: BarChart3,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    tint: "bg-indigo-500/5",
    bar: "from-indigo-500/40 via-indigo-500/10 to-transparent",
  },
};

const titleKeys: SummaryKey[] = ["총 투자액", "오늘 수익", "보유 종목", "총 수익률"];

export const MyStockSummaryCards = () => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {titleKeys.map((title) => {
        const { icon: Icon, iconColor, iconBg, tint, bar } = summaryConfig[title];
        return (
          <Card
            key={title}
            className={cn(
              "min-w-55 flex-1 h-30 rounded-xl border-border overflow-hidden",
              "transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-foreground/15",
              tint
            )}
          >
            {/* 상단 컬러 그라디언트 바 */}
            <div className={cn("h-1 w-full bg-linear-to-r", bar)} />

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pt-3 pb-2 px-4 gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground leading-snug flex-1 min-w-0">
                {title}
              </CardTitle>
              <div className={cn("rounded-lg p-1.5 shrink-0", iconBg)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-3">
              {/* 스켈레톤 로딩 상태 */}
              <div className="h-7 w-28 rounded animate-pulse bg-muted/50" />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                지난 업데이트 대비 +0.0%
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
