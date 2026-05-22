import { Wallet, TrendingDown, CalendarDays, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenseData } from "@/hooks/useExpenseData";
import { useTravelPeriods } from "@/hooks/useTravelPeriods";
import { ExpenseUploadCard } from "./ExpenseUploadCard";
import { ExpenseChartCard } from "./ExpenseChartCard";
import { ExpenseListCard } from "./ExpenseListCard";
import { TravelPeriodCard } from "./TravelPeriodCard";
import { cn } from "@/lib/utils";

const summaryConfig = [
  {
    label: "이번달 지출",
    icon: CalendarDays,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    bar: "from-red-500/40 via-red-500/10 to-transparent",
    key: "thisMonth" as const,
  },
  {
    label: "총 지출",
    icon: TrendingDown,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    bar: "from-orange-500/40 via-orange-500/10 to-transparent",
    key: "total" as const,
  },
  {
    label: "총 수입/환급",
    icon: Wallet,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    bar: "from-emerald-500/40 via-emerald-500/10 to-transparent",
    key: "income" as const,
  },
  {
    label: "여행 경비",
    icon: Plane,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
    bar: "from-sky-500/40 via-sky-500/10 to-transparent",
    key: "travel" as const,
  },
];

export const ExpenseDashboard = () => {
  const {
    transactions,
    loading,
    dailyStats,
    weeklyStats,
    monthlyStats,
    totalExpense,
    totalIncome,
    thisMonthExpense,
    saveTransactions,
  } = useExpenseData();

  const {
    periods,
    tags,
    addPeriod,
    removePeriod,
    getTaggedPeriod,
    tagTransactions,
    untagTransactions,
  } = useTravelPeriods();

  const travelExpense = transactions
    .filter((t) => t.type === "expense" && getTaggedPeriod(t.id))
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const valueMap = {
    thisMonth: thisMonthExpense,
    total: totalExpense,
    income: totalIncome,
    travel: travelExpense,
  };

  return (
    <div className="px-5 pt-5 pb-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">지출 관리</h2>
        <p className="text-sm text-muted-foreground">카카오페이 내역을 업로드하고 소비 패턴을 확인하세요</p>
      </div>

      {/* 요약 카드 */}
      <div className="flex flex-wrap gap-3 mb-6">
        {summaryConfig.map(({ label, icon: Icon, iconColor, iconBg, bar, key }) => (
          <Card
            key={key}
            className={cn(
              "min-w-55 flex-1 rounded-xl border-border overflow-hidden",
              "transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-foreground/15"
            )}
          >
            <div className={cn("h-1 w-full bg-linear-to-r", bar)} />
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pt-3 pb-2 px-4 gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground leading-snug flex-1 min-w-0">
                {label}
              </CardTitle>
              <div className={cn("rounded-lg p-1.5 shrink-0", iconBg)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {loading ? (
                <div className="h-7 w-28 rounded animate-pulse bg-muted/50" />
              ) : (
                <p className="text-xl font-bold text-foreground font-mono">
                  {valueMap[key].toLocaleString()}원
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 섹션 구분 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">통계</h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="mb-6">
        <ExpenseChartCard
          dailyStats={dailyStats}
          weeklyStats={weeklyStats}
          monthlyStats={monthlyStats}
        />
      </div>

      {/* 섹션 구분 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">내역</h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-5">
        <TravelPeriodCard
          periods={periods}
          transactions={transactions}
          tags={tags}
          onAdd={addPeriod}
          onRemove={removePeriod}
        />
        <ExpenseUploadCard onSave={saveTransactions} />
        <ExpenseListCard
          transactions={transactions}
          loading={loading}
          periods={periods}
          tags={tags}
          getTaggedPeriod={getTaggedPeriod}
          tagTransactions={tagTransactions}
          untagTransactions={untagTransactions}
        />
      </div>
    </div>
  );
};
