import { X, Plane, Calendar } from "lucide-react";
import { getCategory, CATEGORY_RULES, type Category } from "@/lib/categoryRules";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";
import type { Transaction } from "@/hooks/useExpenseData";
import { cn } from "@/lib/utils";

interface Props {
  period: TravelPeriod;
  transactions: Transaction[];
  onClose: () => void;
  onUntag: (txId: string) => void;
}

const C = 2 * Math.PI * 45;
const fmt = (d: string) => d.slice(5).replace("-", "/");

export const TravelDetailView = ({ period, transactions, onClose, onUntag }: Props) => {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);

  const nights = Math.round(
    (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / 86400000
  );
  const days = nights + 1;
  const dailyAvg = days > 0 && total > 0 ? Math.round(total / days) : 0;

  const catAmounts: Partial<Record<Category, number>> = {};
  expenses.forEach((t) => {
    const cat = getCategory(t.merchant);
    catAmounts[cat] = (catAmounts[cat] ?? 0) + Math.abs(t.amount);
  });

  const activeCats = (Object.entries(catAmounts) as [Category, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  let cumulativeLen = 0;
  const segments = total > 0
    ? activeCats.map(([cat, amount]) => {
        const len = (amount / total) * C;
        const dashOffset = C - cumulativeLen;
        cumulativeLen += len;
        return { cat, len, dashOffset };
      })
    : [];

  // Day-by-day breakdown
  const dayBreakdown = (() => {
    const map: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((t) => {
      const date = t.transaction_at.slice(0, 10);
      if (date >= period.startDate && date <= period.endDate) {
        if (!map[date]) map[date] = { amount: 0, count: 0 };
        map[date].amount += Math.abs(t.amount);
        map[date].count++;
      }
    });
    return Object.entries(map)
      .map(([date, s]) => ({ date, ...s }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();
  const maxDayAmount = dayBreakdown.length > 0 ? Math.max(...dayBreakdown.map((d) => d.amount)) : 1;

  const sorted = [...transactions].sort((a, b) => b.transaction_at.localeCompare(a.transaction_at));

  const budgetPct = period.budget && period.budget > 0
    ? Math.min((total / period.budget) * 100, 100)
    : 0;
  const overBudget = period.budget != null && total >= period.budget;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-130 z-50 bg-background border-l border-border flex flex-col animate-in slide-in-from-right duration-200 ease-out">

        {/* Hero Header */}
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-linear-to-br from-sky-500/20 via-sky-500/8 to-transparent pointer-events-none" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none">
            <Plane className="w-36 h-36 text-sky-300" />
          </div>

          <div className="relative px-6 pt-5 pb-5">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="rounded-lg bg-sky-500/20 p-1.5 shrink-0">
                    <Plane className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-[11px] font-medium text-sky-400">
                    {fmt(period.startDate)} ~ {fmt(period.endDate)}
                    <span className="ml-1.5 opacity-80">
                      {nights > 0 ? `${nights}박 ${days}일` : "당일"}
                    </span>
                  </p>
                </div>
                <h2 className="text-xl font-bold text-foreground truncate">{period.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "총 지출", value: `${total.toLocaleString()}원` },
                { label: "1일 평균", value: `${dailyAvg.toLocaleString()}원` },
                { label: "거래", value: `${sorted.length}건` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/8 px-3 py-2.5 text-center border border-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-bold text-foreground font-mono">{value}</p>
                </div>
              ))}
            </div>

            {/* Budget bar */}
            {period.budget != null && period.budget > 0 && (
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <p className="text-[10px] text-muted-foreground">
                    예산 <span className={cn("font-medium", overBudget ? "text-red-400" : "text-foreground")}>
                      {Math.round(budgetPct)}%
                    </span> 사용
                    {overBudget && (
                      <span className="text-red-400 ml-1">
                        ({(total - period.budget).toLocaleString()}원 초과)
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {total.toLocaleString()} / {period.budget.toLocaleString()}원
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      overBudget ? "bg-red-500" : budgetPct >= 80 ? "bg-orange-400" : "bg-sky-500"
                    )}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-border/60" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Day-by-day timeline */}
          {dayBreakdown.length > 0 && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">일자별 지출</p>
              </div>
              <div className="space-y-2">
                {dayBreakdown.map(({ date, amount, count }) => {
                  const pct = (amount / maxDayAmount) * 100;
                  const isMax = amount === maxDayAmount;
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <p className="text-[10px] font-mono text-muted-foreground w-10 shrink-0">
                        {date.slice(5, 10).replace("-", "/")}
                      </p>
                      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isMax ? "bg-sky-400" : "bg-sky-500/50"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={cn(
                        "text-[10px] font-mono shrink-0 w-20 text-right",
                        isMax ? "text-sky-400 font-semibold" : "text-muted-foreground"
                      )}>
                        {amount.toLocaleString()}원
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 shrink-0 w-6">{count}건</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category donut */}
          {segments.length > 0 && (
            <div className="px-6 py-4 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3">카테고리별 지출</p>
              <div className="flex items-center gap-6">
                <svg width="110" height="110" className="shrink-0">
                  <circle r={45} cx={55} cy={55} fill="none" stroke="currentColor" strokeWidth={10} className="text-white/5" />
                  {segments.map(({ cat, len, dashOffset }) => (
                    <circle
                      key={cat}
                      r={45}
                      cx={55}
                      cy={55}
                      fill="none"
                      stroke={CATEGORY_RULES[cat].hex}
                      strokeWidth={10}
                      strokeDasharray={`${len} ${C - len}`}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 55 55)"
                      strokeLinecap="butt"
                    />
                  ))}
                  <text x={55} y={52} textAnchor="middle" fill="white" fillOpacity={0.85} fontSize={10} fontWeight="700">
                    {days}일
                  </text>
                  <text x={55} y={64} textAnchor="middle" fill="white" fillOpacity={0.35} fontSize={8}>
                    여행
                  </text>
                </svg>

                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {activeCats.map(([cat, amount]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_RULES[cat].hex }} />
                      <span className="text-xs text-muted-foreground min-w-0 truncate">{cat}</span>
                      <span className="text-xs font-medium text-foreground font-mono ml-auto shrink-0">
                        {amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transaction list */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              거래 내역 <span className="text-foreground">{sorted.length}건</span>
            </p>
            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">태깅된 거래가 없습니다</p>
            ) : (
              <div className="space-y-0.5">
                {sorted.map((t) => {
                  const cat = getCategory(t.merchant);
                  return (
                    <div
                      key={t.id}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-1.5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_RULES[cat].hex + "80" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{t.merchant}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {t.transaction_at.slice(5, 10).replace("-", "/")}
                          <span className="ml-1 opacity-60">{cat}</span>
                        </p>
                      </div>
                      <span className={cn(
                        "text-sm font-mono shrink-0",
                        t.type === "expense" ? "text-foreground" : "text-emerald-500"
                      )}>
                        {t.type === "expense" ? "-" : "+"}{Math.abs(t.amount).toLocaleString()}원
                      </span>
                      <button
                        onClick={() => onUntag(t.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="태그 해제"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
