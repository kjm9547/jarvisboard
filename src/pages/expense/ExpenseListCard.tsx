import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/hooks/useExpenseData";

interface Props {
  transactions: Transaction[];
  loading: boolean;
}

type Filter = "all" | "expense" | "income";

export const ExpenseListCard = ({ transactions, loading }: Props) => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  const filterLabels: Record<Filter, string> = {
    all: "전체",
    expense: "지출",
    income: "수입",
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
        </div>
      </CardHeader>

      <CardContent>
        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 px-1 mb-1">
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

                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-1 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {/* 아이콘 */}
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                      isExpense ? "bg-red-500/15" : "bg-emerald-500/15"
                    )}>
                      {isExpense
                        ? <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
                        : <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      }
                    </div>

                    {/* 사용처 + 날짜 */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                      <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                    </div>

                    {/* 금액 */}
                    <span className={cn(
                      "text-sm font-bold font-mono whitespace-nowrap",
                      isExpense ? "text-red-500" : "text-emerald-500"
                    )}>
                      {isExpense ? "-" : "+"}{Math.abs(t.amount).toLocaleString()}원
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
