import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Plus, Trash2, CalendarRange, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, CATEGORY_RULES, type Category } from "@/lib/categoryRules";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";
import type { Transaction } from "@/hooks/useExpenseData";

interface Props {
  periods: TravelPeriod[];
  transactions: Transaction[];
  tags: Record<string, string>;
  onAdd: (name: string, startDate: string, endDate: string) => Promise<TravelPeriod | null>;
  onRemove: (id: string) => void;
  onSelect: (period: TravelPeriod) => void;
  onTagTransactions: (txIds: string[], periodId: string) => void;
}

const fmt = (d: string) => d.slice(5).replace("-", "/");

export const TravelPeriodCard = ({
  periods, transactions, tags, onAdd, onRemove, onSelect, onTagTransactions,
}: Props) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingTag, setPendingTag] = useState<{ period: TravelPeriod; txIds: string[] } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (pendingTag) {
      timerRef.current = setTimeout(() => setPendingTag(null), 30000);
      return () => clearTimeout(timerRef.current);
    }
  }, [pendingTag]);

  const handleAdd = async () => {
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 모두 입력해주세요");
      return;
    }
    if (startDate > endDate) {
      setError("시작일이 종료일보다 늦을 수 없습니다");
      return;
    }

    setAdding(true);
    const newPeriod = await onAdd(name, startDate, endDate);
    setAdding(false);

    if (newPeriod) {
      setName("");
      setStartDate("");
      setEndDate("");
      setError("");

      const untagged = transactions.filter((t) => {
        const d = t.transaction_at.slice(0, 10);
        return d >= newPeriod.startDate && d <= newPeriod.endDate && !tags[t.id];
      });

      if (untagged.length > 0) {
        setPendingTag({ period: newPeriod, txIds: untagged.map((t) => t.id) });
      }
    }
  };

  const confirmAutoTag = () => {
    if (!pendingTag) return;
    onTagTransactions(pendingTag.txIds, pendingTag.period.id);
    setPendingTag(null);
  };

  const getPeriodStats = (p: TravelPeriod) => {
    const tagged = transactions.filter((t) => tags[t.id] === p.id);
    const expenses = tagged.filter((t) => t.type === "expense");
    const total = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);

    const catAmounts: Partial<Record<Category, number>> = {};
    expenses.forEach((t) => {
      const cat = getCategory(t.merchant);
      catAmounts[cat] = (catAmounts[cat] ?? 0) + Math.abs(t.amount);
    });

    const nights = Math.round(
      (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 86400000
    );
    const days = nights + 1;

    return { count: tagged.length, total, catAmounts, days };
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Plane className="w-5 h-5 text-sky-500" />
          여행 기간
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 입력 폼 */}
        <div className="space-y-2">
          <Input
            placeholder="여행 이름 (예: 도쿄 여행)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-border text-sm h-8"
          />
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setError(""); }}
              className="bg-white/5 border-border text-sm h-8 flex-1"
            />
            <span className="text-xs text-muted-foreground shrink-0">~</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setError(""); }}
              className="bg-white/5 border-border text-sm h-8 flex-1"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button onClick={handleAdd} size="sm" className="w-full h-8 text-xs gap-1.5" disabled={adding}>
            <Plus className="w-3.5 h-3.5" />
            {adding ? "추가 중..." : "기간 추가"}
          </Button>
        </div>

        {/* 자동 태깅 확인 배너 */}
        {pendingTag && (
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 px-3 py-2.5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-sky-400 font-medium">
                {pendingTag.txIds.length}건의 거래가 이 기간에 있어요
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">여행 경비로 추가하시겠어요?</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={confirmAutoTag}
                className="text-[10px] font-medium text-sky-400 hover:text-sky-300 px-2 py-1 rounded-md hover:bg-sky-500/10 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => setPendingTag(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 여행 목록 */}
        {periods.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-muted-foreground">
            <CalendarRange className="w-7 h-7 opacity-30" />
            <p className="text-xs">등록된 여행 기간이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((p) => {
              const { count, total, catAmounts, days } = getPeriodStats(p);
              const isOngoing = today >= p.startDate && today <= p.endDate;
              const catTotal = Object.values(catAmounts).reduce((s, v) => s + (v ?? 0), 0);
              const dailyAvg = days > 0 && total > 0 ? Math.round(total / days) : 0;
              const catEntries = (Object.entries(catAmounts) as [Category, number][])
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a);

              return (
                <div key={p.id} className="rounded-xl bg-sky-500/5 border border-sky-500/20 overflow-hidden">
                  {/* 카테고리 컬러 바 */}
                  {catTotal > 0 && (
                    <div className="flex h-1">
                      {catEntries.map(([cat, amount]) => (
                        <div
                          key={cat}
                          style={{
                            backgroundColor: CATEGORY_RULES[cat].hex,
                            width: `${(amount / catTotal) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Plane className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                            {isOngoing && (
                              <span className="shrink-0 text-[9px] font-medium bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full">
                                진행 중
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {fmt(p.startDate)} ~ {fmt(p.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => onSelect(p)}
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            "text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10"
                          )}
                          title="상세 보기"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemove(p.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {count > 0 ? (
                      <div className="mt-2 pt-2 border-t border-sky-500/15 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{count}건</span>
                        {dailyAvg > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            · 일평균 {dailyAvg.toLocaleString()}원
                          </span>
                        )}
                        <span className="text-sm font-bold text-sky-500 font-mono ml-auto">
                          {total.toLocaleString()}원
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                        거래 내역에서 여행 경비를 선택해주세요
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
