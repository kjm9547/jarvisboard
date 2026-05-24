import { X, Plane } from "lucide-react";
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

const C = 2 * Math.PI * 45; // circle circumference for r=45

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

  // Build SVG donut segments: dasharray="${len} ${C - len}", dashoffset = C - cumulativeStart
  let cumulativeLen = 0;
  const segments = total > 0
    ? activeCats.map(([cat, amount]) => {
        const len = (amount / total) * C;
        const dashOffset = C - cumulativeLen;
        cumulativeLen += len;
        return { cat, len, dashOffset };
      })
    : [];

  const fmt = (d: string) => d.slice(5).replace("-", "/");
  const sorted = [...transactions].sort((a, b) => b.transaction_at.localeCompare(a.transaction_at));

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[520px] z-50 bg-background border-l border-border flex flex-col animate-in slide-in-from-right duration-200 ease-out">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-xl bg-sky-500/10 p-2.5 shrink-0">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{period.name}</h2>
              <p className="text-xs text-muted-foreground">
                {fmt(period.startDate)} ~ {fmt(period.endDate)}
                <span className="ml-1.5 text-sky-500 font-medium">
                  {nights > 0 ? `${nights}박 ${days}일` : "당일"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-border">
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">총 지출</p>
              <p className="text-xl font-bold text-foreground font-mono">{total.toLocaleString()}원</p>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">1일 평균</p>
              <p className="text-xl font-bold text-foreground font-mono">{dailyAvg.toLocaleString()}원</p>
            </div>
          </div>

          {/* Donut chart */}
          {segments.length > 0 && (
            <div className="px-6 py-4 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3">카테고리별 지출</p>
              <div className="flex items-center gap-6">
                <svg width="120" height="120" className="shrink-0">
                  {/* Track */}
                  <circle r={45} cx={60} cy={60} fill="none" stroke="currentColor" strokeWidth={10} className="text-white/5" />
                  {/* Segments */}
                  {segments.map(({ cat, len, dashOffset }) => (
                    <circle
                      key={cat}
                      r={45}
                      cx={60}
                      cy={60}
                      fill="none"
                      stroke={CATEGORY_RULES[cat].hex}
                      strokeWidth={10}
                      strokeDasharray={`${len} ${C - len}`}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="butt"
                    />
                  ))}
                  <text x={60} y={57} textAnchor="middle" fill="white" fillOpacity={0.9} fontSize={11} fontWeight="600">
                    {days}일
                  </text>
                  <text x={60} y={70} textAnchor="middle" fill="white" fillOpacity={0.4} fontSize={9}>
                    여행
                  </text>
                </svg>

                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {activeCats.map(([cat, amount]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_RULES[cat].hex }} />
                      <span className="text-xs text-muted-foreground">{cat}</span>
                      <span className="text-xs font-medium text-foreground font-mono ml-auto">
                        {amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Budget bar */}
          {period.budget != null && period.budget > 0 && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex justify-between items-baseline mb-1.5">
                <p className="text-xs font-medium text-muted-foreground">예산 사용률</p>
                <p className="text-xs font-mono text-foreground">
                  {total.toLocaleString()}원 / {period.budget.toLocaleString()}원
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    total >= period.budget ? "bg-red-500" :
                    total / period.budget >= 0.8 ? "bg-orange-500" : "bg-sky-500"
                  )}
                  style={{ width: `${Math.min((total / period.budget) * 100, 100)}%` }}
                />
              </div>
              <p className={cn(
                "text-[10px] mt-1",
                total >= period.budget ? "text-red-500" :
                total / period.budget >= 0.8 ? "text-orange-500" : "text-muted-foreground"
              )}>
                {Math.round((total / period.budget) * 100)}% 사용
                {total > period.budget && ` (${(total - period.budget).toLocaleString()}원 초과)`}
              </p>
            </div>
          )}

          {/* Transaction list */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              거래 내역 <span className="text-foreground">{sorted.length}건</span>
            </p>
            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">태깅된 거래가 없습니다</p>
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
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_RULES[cat].hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{t.merchant}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {t.transaction_at.slice(5, 10).replace("-", "/")}
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
