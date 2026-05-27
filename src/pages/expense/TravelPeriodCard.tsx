import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plane, Plus, Trash2, CalendarRange, ChevronRight,
  CheckCircle2, Pencil, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, CATEGORY_RULES, type Category } from "@/lib/categoryRules";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";
import type { Transaction } from "@/hooks/useExpenseData";

interface Props {
  periods: TravelPeriod[];
  transactions: Transaction[];
  tags: Record<string, string>;
  pendingTag: { period: TravelPeriod; txIds: string[] } | null;
  onAdd: (name: string, startDate: string, endDate: string, budget?: number) => Promise<TravelPeriod | null>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, startDate: string, endDate: string, budget?: number) => Promise<void>;
  onSelect: (period: TravelPeriod) => void;
  onTriggerAutoTag: (transactions: Transaction[], newPeriod?: TravelPeriod) => void;
  onConfirmPendingTag: () => void;
  onDismissPendingTag: () => void;
}

type TripStatus = "upcoming" | "ongoing" | "past";

const fmt = (d: string) => d.slice(5).replace("-", "/");

const STATUS_CONFIG: Record<TripStatus, {
  card: string;
  badge: string;
  accent: string;
  divider: string;
}> = {
  upcoming: {
    card: "border-amber-500/30 bg-amber-500/5",
    badge: "bg-amber-500/20 text-amber-400",
    accent: "text-amber-400",
    divider: "border-amber-500/15",
  },
  ongoing: {
    card: "border-sky-500/40 bg-sky-500/5",
    badge: "bg-sky-500/20 text-sky-400",
    accent: "text-sky-400",
    divider: "border-sky-500/20",
  },
  past: {
    card: "border-border bg-white/[0.02]",
    badge: "bg-muted/40 text-muted-foreground",
    accent: "text-muted-foreground",
    divider: "border-border/50",
  },
};

const parseBudget = (s: string): number | undefined => {
  const n = parseInt(s.replace(/,/g, ""), 10);
  return isNaN(n) || n <= 0 ? undefined : n;
};

export const TravelPeriodCard = ({
  periods, transactions, tags, pendingTag,
  onAdd, onRemove, onUpdate, onSelect,
  onTriggerAutoTag, onConfirmPendingTag, onDismissPendingTag,
}: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetStr, setBudgetStr] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editBudgetStr, setEditBudgetStr] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const getStatus = (p: TravelPeriod): TripStatus => {
    if (today < p.startDate) return "upcoming";
    if (today <= p.endDate) return "ongoing";
    return "past";
  };

  const getDDays = (startDate: string): number =>
    Math.ceil((new Date(startDate).getTime() - new Date(today).getTime()) / 86400000);

  const handleAdd = async () => {
    if (!startDate || !endDate) { setError("시작일과 종료일을 모두 입력해주세요"); return; }
    if (startDate > endDate) { setError("시작일이 종료일보다 늦을 수 없습니다"); return; }

    setAdding(true);
    const newPeriod = await onAdd(name, startDate, endDate, parseBudget(budgetStr));
    setAdding(false);

    if (newPeriod) {
      setName(""); setStartDate(""); setEndDate(""); setBudgetStr(""); setError("");
      setFormOpen(false);
      onTriggerAutoTag(transactions, newPeriod);
    }
  };

  const startEdit = (p: TravelPeriod) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditStart(p.startDate);
    setEditEnd(p.endDate);
    setEditBudgetStr(p.budget ? String(p.budget) : "");
    setEditError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const handleUpdate = async () => {
    if (!editStart || !editEnd) { setEditError("시작일과 종료일을 모두 입력해주세요"); return; }
    if (editStart > editEnd) { setEditError("시작일이 종료일보다 늦을 수 없습니다"); return; }
    setSaving(true);
    await onUpdate(editingId!, editName, editStart, editEnd, parseBudget(editBudgetStr));
    setSaving(false);
    setEditingId(null);
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

    return { count: tagged.length, total, catAmounts, nights, days: nights + 1 };
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Plane className="w-5 h-5 text-sky-500" />
          여행 기간
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 자동 태깅 확인 배너 */}
        {pendingTag && (
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 px-3 py-2.5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-sky-400 font-medium">
                {pendingTag.txIds.length}건의 거래가 이 기간에 있어요
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {pendingTag.period.name}에 여행 경비로 추가할까요?
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={onConfirmPendingTag}
                className="text-[10px] font-medium text-sky-400 hover:text-sky-300 px-2 py-1 rounded-md hover:bg-sky-500/10 transition-colors"
              >
                추가
              </button>
              <button
                onClick={onDismissPendingTag}
                className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 여행 목록 */}
        {periods.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-7 text-muted-foreground">
            <CalendarRange className="w-9 h-9 opacity-20" />
            <p className="text-xs font-medium">등록된 여행 기간이 없습니다</p>
            <p className="text-[10px] text-muted-foreground/60">아래 버튼으로 첫 여행을 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((p) => {
              const isEditing = editingId === p.id;
              const isDeleting = deletingId === p.id;

              if (isEditing) {
                return (
                  <div key={p.id} className="rounded-xl bg-sky-500/5 border border-sky-500/30 px-3 py-2.5 space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="여행 이름"
                      className="bg-white/5 border-border text-sm h-7"
                    />
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={editStart}
                        onChange={(e) => { setEditStart(e.target.value); setEditError(""); }}
                        className="bg-white/5 border-border text-xs h-7 flex-1"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">~</span>
                      <Input
                        type="date"
                        value={editEnd}
                        onChange={(e) => { setEditEnd(e.target.value); setEditError(""); }}
                        className="bg-white/5 border-border text-xs h-7 flex-1"
                      />
                    </div>
                    <Input
                      type="number"
                      placeholder="예산 (선택, 원)"
                      value={editBudgetStr}
                      onChange={(e) => setEditBudgetStr(e.target.value)}
                      className="bg-white/5 border-border text-xs h-7"
                    />
                    {editError && <p className="text-[10px] text-red-500">{editError}</p>}
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={handleUpdate} disabled={saving}>
                        <Check className="w-3 h-3" />
                        {saving ? "저장 중..." : "저장"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={cancelEdit}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              }

              if (isDeleting) {
                return (
                  <div key={p.id} className="rounded-xl bg-red-500/5 border border-red-500/30 px-3 py-2.5">
                    <p className="text-xs text-foreground mb-2">
                      <span className="font-medium">{p.name}</span>을 삭제하면
                      {getPeriodStats(p).count > 0 && (
                        <span className="text-red-400"> {getPeriodStats(p).count}건의 태깅도 함께 사라집니다.</span>
                      )}
                    </p>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm" variant="destructive" className="h-7 text-xs flex-1"
                        onClick={() => { onRemove(p.id); setDeletingId(null); }}
                      >
                        삭제
                      </Button>
                      <Button
                        size="sm" variant="ghost" className="h-7 text-xs flex-1"
                        onClick={() => setDeletingId(null)}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                );
              }

              const { count, total, catAmounts, nights, days } = getPeriodStats(p);
              const status = getStatus(p);
              const sc = STATUS_CONFIG[status];
              const catTotal = Object.values(catAmounts).reduce((s, v) => s + (v ?? 0), 0);
              const dailyAvg = days > 0 && total > 0 ? Math.round(total / days) : 0;
              const catEntries = (Object.entries(catAmounts) as [Category, number][])
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a);
              const ddays = status === "upcoming" ? getDDays(p.startDate) : 0;
              const budgetPct = p.budget && p.budget > 0 ? Math.min((total / p.budget) * 100, 100) : 0;
              const overBudget = p.budget != null && total >= p.budget;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "group rounded-xl border overflow-hidden cursor-pointer",
                    "transition-all duration-150 hover:shadow-md hover:scale-[1.005]",
                    sc.card
                  )}
                  onClick={() => onSelect(p)}
                >
                  {/* Category color bar */}
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
                    {/* Header row */}
                    <div className="flex items-start gap-2">
                      <Plane className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", sc.accent)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", sc.badge)}>
                            {status === "upcoming" ? `D-${ddays}` : status === "ongoing" ? "진행 중" : "완료"}
                          </span>
                          {p.budget != null && overBudget && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 shrink-0">
                              예산 초과
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {fmt(p.startDate)} ~ {fmt(p.endDate)}
                          {nights > 0 && <span className="opacity-60 ml-1">· {nights}박 {days}일</span>}
                        </p>
                      </div>

                      {/* Actions (visible on hover) */}
                      <div
                        className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                          className="p-1 rounded-md text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(p.id); }}
                          className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Budget progress bar */}
                    {p.budget != null && p.budget > 0 && (
                      <div className="mt-2">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              overBudget ? "bg-red-500" :
                              budgetPct >= 80 ? "bg-orange-400" : "bg-sky-500"
                            )}
                            style={{ width: `${budgetPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats row */}
                    {count > 0 ? (
                      <div className={cn("mt-2 pt-2 border-t flex items-center gap-2", sc.divider)}>
                        <span className="text-[10px] text-muted-foreground">{count}건</span>
                        {dailyAvg > 0 && (
                          <span className="text-[10px] text-muted-foreground">· 일평균 {dailyAvg.toLocaleString()}원</span>
                        )}
                        {p.budget != null && p.budget > 0 && (
                          <span className={cn("text-[10px] ml-auto mr-0.5", overBudget ? "text-red-400" : "text-muted-foreground")}>
                            / {p.budget.toLocaleString()}원
                          </span>
                        )}
                        <span className={cn(
                          "text-sm font-bold font-mono shrink-0",
                          p.budget == null ? "ml-auto" : "",
                          sc.accent
                        )}>
                          {total.toLocaleString()}원
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                        {status === "upcoming"
                          ? `여행까지 ${ddays}일 남았어요`
                          : transactions.length === 0
                            ? "내역을 먼저 업로드하면 자동으로 묶어드려요"
                            : "이 기간에 해당하는 지출이 없어요"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 폼 아코디언 */}
        {formOpen ? (
          <div className="space-y-2 pt-1 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground pt-1">새 여행 추가</p>
            <Input
              placeholder="여행 이름 (예: 도쿄 여행)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-border text-sm h-8"
              autoFocus
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
            <Input
              type="number"
              placeholder="예산 (선택, 원)"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              className="bg-white/5 border-border text-sm h-8"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-1.5">
              <Button onClick={handleAdd} size="sm" className="h-8 text-xs gap-1.5 flex-1" disabled={adding}>
                <Plus className="w-3.5 h-3.5" />
                {adding ? "추가 중..." : "추가"}
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 text-xs px-3"
                onClick={() => { setFormOpen(false); setError(""); }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5 border-dashed border-sky-500/30 text-muted-foreground hover:text-sky-400 hover:border-sky-500/50"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            새 여행 추가
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
