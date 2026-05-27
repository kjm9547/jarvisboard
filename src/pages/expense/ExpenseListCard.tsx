import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, ArrowDownLeft, ArrowUpRight, Plane, X, Check, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
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
  onUpdateMeta: (id: string, fields: { category?: string | null; note?: string | null }) => void;
}

type Filter = "all" | "expense" | "income" | "flagged";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m)}월`;
};

const fmtDayHeader = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`;
};

export const ExpenseListCard = ({
  transactions,
  loading,
  periods,
  tags,
  getTaggedPeriod,
  tagTransactions,
  untagTransactions,
  onUpdateMeta,
}: Props) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [tagMode, setTagMode] = useState(false);
  const [activePeriodId, setActivePeriodId] = useState<string>("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const monthScrollRef = useRef<HTMLDivElement>(null);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.transaction_at.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const defaultMonth = availableMonths[0] ?? new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths]);

  const currentMonthIdx = availableMonths.indexOf(selectedMonth);
  const canPrev = currentMonthIdx < availableMonths.length - 1;
  const canNext = currentMonthIdx > 0;
  const goPrev = () => canPrev && setSelectedMonth(availableMonths[currentMonthIdx + 1]);
  const goNext = () => canNext && setSelectedMonth(availableMonths[currentMonthIdx - 1]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const monthMatch = t.transaction_at.slice(0, 7) === selectedMonth;
      const typeMatch =
        filter === "all" ? true
        : filter === "flagged" ? !!t.note
        : t.type === filter;
      return monthMatch && typeMatch;
    });
  }, [transactions, selectedMonth, filter]);

  const groupedByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      const date = t.transaction_at.slice(0, 10);
      if (!map[date]) map[date] = [];
      map[date].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const monthSummary = useMemo(() => {
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    return { expense, income };
  }, [filtered]);

  const flaggedCount = useMemo(
    () => transactions.filter((t) => t.transaction_at.slice(0, 7) === selectedMonth && !!t.note).length,
    [transactions, selectedMonth]
  );

  const filterLabels: Record<Filter, string> = {
    all: "전체",
    expense: "지출",
    income: "수입",
    flagged: `특이사항${flaggedCount > 0 ? ` ${flaggedCount}` : ""}`,
  };

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

  const openNoteEdit = (t: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (noteEditId === t.id) {
      setNoteEditId(null);
    } else {
      setNoteEditId(t.id);
      setNoteInput(t.note ?? "");
    }
  };

  const saveNote = (id: string) => {
    onUpdateMeta(id, { note: noteInput.trim() || null });
    setNoteEditId(null);
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
            <div className="flex gap-1 flex-wrap">
              {(["all", "expense", "income", "flagged"] as Filter[]).map((f) => (
                <Badge
                  key={f}
                  variant={filter === f ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer text-xs px-2.5 py-1 transition-all",
                    filter === f
                      ? f === "flagged"
                        ? "bg-yellow-500 text-white"
                        : "bg-primary text-primary-foreground"
                      : f === "flagged"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
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
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 px-2" onClick={exitTagMode}>
                <X className="w-3 h-3" />
                취소
              </Button>
            )}
          </div>
        </div>

        {/* 월 선택 */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div ref={monthScrollRef} className="flex-1 overflow-x-auto scrollbar-none">
            <div className="flex gap-1 pb-0.5">
              {availableMonths.map((ym) => (
                <button
                  key={ym}
                  onClick={() => setSelectedMonth(ym)}
                  className={cn(
                    "shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap",
                    selectedMonth === ym
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {ym.slice(0, 4) !== new Date().getFullYear().toString()
                    ? fmtMonth(ym)
                    : `${parseInt(ym.slice(5))}월`}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* 월 요약 */}
        {!loading && filter !== "flagged" && (
          <div className="flex items-center gap-3 mt-1 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">지출</span>
              <span className="text-xs font-bold font-mono text-red-500">
                {monthSummary.expense.toLocaleString()}원
              </span>
            </div>
            {monthSummary.income > 0 && (
              <>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">수입</span>
                  <span className="text-xs font-bold font-mono text-emerald-500">
                    +{monthSummary.income.toLocaleString()}원
                  </span>
                </div>
              </>
            )}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground">{fmtMonth(selectedMonth)}</span>
          </div>
        )}

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

      <CardContent className="pt-0">
        {/* Column header */}
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 px-1 mb-1",
            tagMode
              ? "grid grid-cols-[auto_auto_1fr_auto_auto] gap-3"
              : "grid grid-cols-[auto_1fr_auto_auto] gap-3"
          )}
        >
          {tagMode && <span className="w-4" />}
          <span className="w-7" />
          <span>사용처</span>
          <span className="text-right">금액</span>
          <span className="w-5" />
        </div>

        <ScrollArea className="h-105">
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
            <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground py-16 gap-1">
              {filter === "flagged" ? (
                <>
                  <MessageSquare className="w-8 h-8 opacity-20 mb-1" />
                  <span>이 달에 등록된 특이사항이 없습니다</span>
                  <span className="text-xs">거래 행의 💬 아이콘을 눌러 메모를 추가하세요</span>
                </>
              ) : (
                <>
                  <span>해당 월에 내역이 없습니다</span>
                  <span className="text-xs">{fmtMonth(selectedMonth)}</span>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0 pt-1">
              {groupedByDate.map(([date, txs]) => {
                const dayExpense = txs
                  .filter((t) => t.type === "expense")
                  .reduce((s, t) => s + Math.abs(t.amount), 0);

                return (
                  <div key={date}>
                    {/* 날짜 헤더 */}
                    <div className="flex items-center justify-between px-1 py-1.5 mt-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {fmtDayHeader(date)}
                      </span>
                      {dayExpense > 0 && (
                        <span className="text-[10px] font-mono text-red-400">
                          -{dayExpense.toLocaleString()}원
                        </span>
                      )}
                    </div>

                    {txs.map((t) => {
                      const isExpense = t.type === "expense";
                      const d = new Date(t.transaction_at);
                      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      const taggedPeriod = getTaggedPeriod(t.id);
                      const isChecked = checkedIds.has(t.id);
                      const isTravel = isChecked || !!taggedPeriod;

                      return (
                        <div key={t.id}>
                          {/* Main row */}
                          <div
                            onClick={() => tagMode && isExpense && toggleCheck(t.id)}
                            className={cn(
                              "grid items-center gap-3 px-1 py-2 rounded-lg transition-colors group",
                              tagMode
                                ? "grid-cols-[auto_auto_1fr_auto_auto] cursor-pointer select-none"
                                : "grid-cols-[auto_1fr_auto_auto]",
                              isChecked
                                ? "bg-sky-500/15"
                                : taggedPeriod
                                  ? "bg-sky-500/5 hover:bg-sky-500/10"
                                  : "hover:bg-white/5"
                            )}
                          >
                            {/* Checkbox */}
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

                            {/* Merchant + time */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                                {taggedPeriod && (
                                  <span className="text-[10px] font-semibold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                                    ✈ {taggedPeriod.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">{timeStr}</p>
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

                            {/* Note button */}
                            <button
                              onClick={(e) => openNoteEdit(t, e)}
                              className={cn(
                                "w-5 h-5 flex items-center justify-center rounded transition-all shrink-0",
                                t.note
                                  ? "text-yellow-500"
                                  : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                              )}
                              title="특이사항 메모"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Note display */}
                          {t.note && noteEditId !== t.id && (
                            <div className="flex items-start gap-1.5 px-1 pb-1 ml-10">
                              <MessageSquare className="w-2.5 h-2.5 text-yellow-500/50 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-yellow-500/80">{t.note}</p>
                            </div>
                          )}

                          {/* Note editor */}
                          {noteEditId === t.id && (
                            <div className="flex items-center gap-2 px-1 pb-1.5 ml-10">
                              <input
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveNote(t.id);
                                  if (e.key === "Escape") setNoteEditId(null);
                                }}
                                placeholder="특이사항 메모..."
                                className="flex-1 min-w-0 text-xs bg-yellow-500/5 border border-yellow-500/20 rounded-md px-2 py-1 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-500/40"
                                autoFocus
                              />
                              <button
                                onClick={() => saveNote(t.id)}
                                className="text-[10px] text-yellow-500 px-2 py-1 rounded hover:bg-yellow-500/10 shrink-0"
                              >
                                저장
                              </button>
                              {t.note && (
                                <button
                                  onClick={() => { onUpdateMeta(t.id, { note: null }); setNoteEditId(null); }}
                                  className="text-[10px] text-muted-foreground hover:text-red-500 shrink-0"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
