import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, ArrowDownLeft, ArrowUpRight, Plane, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/hooks/useExpenseData";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  periods: TravelPeriod[];
  tags: Record<string, string>;
  getTaggedPeriod: (txId: string) => TravelPeriod | undefined;
  tagTransactions: (txIds: string[], periodId: string) => void;
  untagTransactions: (txIds: string[]) => void;
}

type Filter = "all" | "expense" | "income";

export const ExpenseListCard = ({
  transactions,
  loading,
  periods,
  tags,
  getTaggedPeriod,
  tagTransactions,
  untagTransactions,
}: Props) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [tagMode, setTagMode] = useState(false);
  const [activePeriodId, setActivePeriodId] = useState<string>("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const filtered = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  const filterLabels: Record<Filter, string> = { all: "전체", expense: "지출", income: "수입" };

  const enterTagMode = () => {
    setTagMode(true);
    setActivePeriodId(periods[0]?.id ?? "");
    setCheckedIds(new Set());
  };

  const exitTagMode = () => {
    setTagMode(false);
    setActivePeriodId("");
    setCheckedIds(new Set());
  };

  const toggleCheck = (txId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(txId)) next.delete(txId);
      else next.add(txId);
      return next;
    });
  };

  const expenseIds = filtered.filter((t) => t.type === "expense").map((t) => t.id);
  const allChecked = expenseIds.length > 0 && expenseIds.every((id) => checkedIds.has(id));

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        expenseIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        expenseIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleSave = () => {
    if (!activePeriodId || checkedIds.size === 0) return;
    tagTransactions([...checkedIds], activePeriodId);
    exitTagMode();
  };

  const handleUntag = () => {
    untagTransactions([...checkedIds]);
    exitTagMode();
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <List className="w-5 h-5 text-indigo-500" />
            거래 내역
            {!loading && (
              <Badge variant="secondary" className="text-xs font-mono">
                {filtered.length}건
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(["all", "expense", "income"] as Filter[]).map((f) => (
                <Badge
                  key={f}
                  variant={filter === f ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer text-xs px-2.5 py-1 transition-all",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setFilter(f)}
                >
                  {filterLabels[f]}
                </Badge>
              ))}
            </div>
            {!tagMode ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 px-2.5 border-sky-500/40 text-sky-500 hover:bg-sky-500/10 hover:border-sky-500/60"
                onClick={enterTagMode}
                disabled={periods.length === 0}
                title={periods.length === 0 ? "여행 기간을 먼저 추가해주세요" : undefined}
              >
                <Plane className="w-3 h-3" />
                여행 추가
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 px-2"
                onClick={exitTagMode}
              >
                <X className="w-3 h-3" />
                취소
              </Button>
            )}
          </div>
        </div>

        {/* Tag mode controls */}
        {tagMode && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <select
              value={activePeriodId}
              onChange={(e) => setActivePeriodId(e.target.value)}
              className="flex-1 min-w-0 h-7 text-xs rounded-md border border-border bg-background px-2 text-foreground"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={toggleAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap shrink-0"
            >
              {allChecked ? "전체 해제" : "전체 선택"}
            </button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1 px-2.5 bg-sky-500 hover:bg-sky-600 text-white shrink-0"
              onClick={handleSave}
              disabled={checkedIds.size === 0 || !activePeriodId}
            >
              <Check className="w-3 h-3" />
              {checkedIds.size > 0 ? `${checkedIds.size}건 저장` : "저장"}
            </Button>
            {checkedIds.size > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2 text-muted-foreground shrink-0"
                onClick={handleUntag}
              >
                태그 해제
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Column header */}
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 px-1 mb-1",
            tagMode ? "grid grid-cols-[auto_auto_1fr_auto] gap-3" : "grid grid-cols-[auto_1fr_auto] gap-3"
          )}
        >
          {tagMode && <span className="w-4" />}
          <span className="w-7" />
          <span>사용처</span>
          <span className="text-right">금액</span>
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-1 py-2.5 gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-muted/40 animate-pulse shrink-0" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-3.5 w-32 rounded bg-muted/40 animate-pulse" />
                      <div className="h-2.5 w-20 rounded bg-muted/30 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground py-12">
              내역이 없습니다
            </div>
          ) : (
            <div className="space-y-0.5 pt-1">
              {filtered.map((t) => {
                const isExpense = t.type === "expense";
                const date = new Date(t.transaction_at);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
                const taggedPeriod = getTaggedPeriod(t.id);
                const isChecked = checkedIds.has(t.id);
                const isTravel = isChecked || !!taggedPeriod;

                return (
                  <div
                    key={t.id}
                    onClick={() => tagMode && isExpense && toggleCheck(t.id)}
                    className={cn(
                      "grid items-center gap-3 px-1 py-2.5 rounded-lg transition-colors",
                      tagMode
                        ? "grid-cols-[auto_auto_1fr_auto] cursor-pointer select-none"
                        : "grid-cols-[auto_1fr_auto]",
                      isChecked
                        ? "bg-sky-500/15"
                        : taggedPeriod
                          ? "bg-sky-500/5 hover:bg-sky-500/10"
                          : "hover:bg-white/5"
                    )}
                  >
                    {/* Checkbox (tag mode only) */}
                    {tagMode && (
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          isExpense
                            ? isChecked
                              ? "border-sky-500 bg-sky-500"
                              : "border-border"
                            : "border-transparent"
                        )}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                        isTravel
                          ? "bg-sky-500/15"
                          : isExpense
                            ? "bg-red-500/15"
                            : "bg-emerald-500/15"
                      )}
                    >
                      {isTravel ? (
                        <Plane className="h-3.5 w-3.5 text-sky-500" />
                      ) : isExpense ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>

                    {/* Merchant + date */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                        {taggedPeriod && (
                          <span className="text-[10px] font-semibold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                            ✈ {taggedPeriod.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                    </div>

                    {/* Amount */}
                    <span
                      className={cn(
                        "text-sm font-bold font-mono whitespace-nowrap",
                        isTravel
                          ? "text-sky-500"
                          : isExpense
                            ? "text-red-500"
                            : "text-emerald-500"
                      )}
                    >
                      {isExpense ? "-" : "+"}
                      {Math.abs(t.amount).toLocaleString()}원
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
