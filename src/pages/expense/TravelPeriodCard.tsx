import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Plus, Trash2, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";
import type { Transaction } from "@/hooks/useExpenseData";

interface Props {
  periods: TravelPeriod[];
  transactions: Transaction[];
  tags: Record<string, string>;
  onAdd: (name: string, startDate: string, endDate: string) => void;
  onRemove: (id: string) => void;
}

const formatDateRange = (start: string, end: string) => {
  const fmt = (d: string) => d.slice(5).replace("-", "/");
  return `${fmt(start)} ~ ${fmt(end)}`;
};

export const TravelPeriodCard = ({ periods, transactions, tags, onAdd, onRemove }: Props) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 모두 입력해주세요");
      return;
    }
    if (startDate > endDate) {
      setError("시작일이 종료일보다 늦을 수 없습니다");
      return;
    }
    onAdd(name, startDate, endDate);
    setName("");
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const getPeriodStats = (periodId: string) => {
    const tagged = transactions.filter((t) => tags[t.id] === periodId);
    const total = tagged
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { count: tagged.length, total };
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Plane className="w-5 h-5 text-sky-500" />
          여행 기간 설정
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          여행 경비로 표시할 거래를 직접 선택할 수 있습니다
        </p>
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
          <Button
            onClick={handleAdd}
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            기간 추가
          </Button>
        </div>

        {/* 등록된 여행 기간 목록 */}
        {periods.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-muted-foreground">
            <CalendarRange className="w-7 h-7 opacity-30" />
            <p className="text-xs">등록된 여행 기간이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((p) => {
              const { count, total } = getPeriodStats(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-xl px-3 py-2.5",
                    "bg-sky-500/5 border border-sky-500/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Plane className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {formatDateRange(p.startDate, p.endDate)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 여행 지출 요약 */}
                  {count > 0 ? (
                    <div className="mt-2 pt-2 border-t border-sky-500/15 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{count}건 선택됨</span>
                      <span className="text-sm font-bold text-sky-500 font-mono">
                        {total.toLocaleString()}원
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                      거래 내역에서 여행 경비를 선택해주세요
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
