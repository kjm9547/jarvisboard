import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategory, CATEGORY_RULES, CATEGORY_KEYS, type Category } from "@/lib/categoryRules";
import type { TravelPeriod } from "@/hooks/useTravelPeriods";
import type { Transaction } from "@/hooks/useExpenseData";
import ReactECharts from "echarts-for-react";

interface Props {
  periods: TravelPeriod[];
  transactions: Transaction[];
  tags: Record<string, string>;
}

type View = "compare" | "category";

const SHORT_NAME_MAX = 8;
const shortenName = (name: string) =>
  name.length > SHORT_NAME_MAX ? name.slice(0, SHORT_NAME_MAX) + "…" : name;

const fmtWon = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}만` : `${v}`;

export const TravelChartCard = ({ periods, transactions, tags }: Props) => {
  const [view, setView] = useState<View>("compare");

  // 여행별 통계 계산
  const travelStats = useMemo(() => {
    return periods
      .map((p) => {
        const txs = transactions.filter((t) => tags[t.id] === p.id && t.type === "expense");
        const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);

        const catAmounts: Partial<Record<Category, number>> = {};
        txs.forEach((t) => {
          const cat = getCategory(t.merchant);
          catAmounts[cat] = (catAmounts[cat] ?? 0) + Math.abs(t.amount);
        });

        return { period: p, total, catAmounts, txCount: txs.length };
      })
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [periods, transactions, tags]);

  const hasData = travelStats.length > 0;

  // ── View: compare (총 지출 비교) ──────────────────────────────────────────
  const compareOption = useMemo(() => {
    const names = travelStats.map((s) => shortenName(s.period.name));
    const values = travelStats.map((s) => s.total);
    const budgets = travelStats.map((s) => s.period.budget ?? null);
    const maxVal = Math.max(...values, 1);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(12,12,18,0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: { name: string; value: number; dataIndex: number }[]) => {
          const p = params[0];
          const budget = budgets[p.dataIndex];
          const pct = budget ? Math.round((p.value / budget) * 100) : null;
          let html = `<b>${travelStats[p.dataIndex].period.name}</b><br/>`;
          html += `지출: <b style="color:#38bdf8">${p.value.toLocaleString()}원</b>`;
          if (budget) {
            html += `<br/>예산: ${budget.toLocaleString()}원`;
            html += ` <span style="color:${pct! >= 100 ? '#f87171' : '#4ade80'}">(${pct}%)</span>`;
          }
          return html;
        },
      },
      grid: { left: "2%", right: "8%", bottom: "2%", top: "4%", containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
        axisLabel: {
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          formatter: (v: number) => fmtWon(v),
        },
      },
      yAxis: {
        type: "category",
        data: names,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: v === maxVal ? "rgba(56,189,248,0.9)" : "rgba(56,189,248,0.45)",
              borderRadius: [0, 6, 6, 0],
            },
            label: {
              show: true,
              position: "right",
              formatter: () => fmtWon(v),
              color: "rgba(255,255,255,0.5)",
              fontSize: 10,
            },
          })),
          barMaxWidth: 36,
          emphasis: { itemStyle: { color: "rgba(56,189,248,1)" } },
          // 예산 마커
          markLine: {
            silent: true,
            symbol: "none",
            data: budgets
              .map((b, i) => (b ? { xAxis: b, lineStyle: { color: "#f97316", type: "dashed", width: 1.5 }, label: { show: false } } : null))
              .filter(Boolean),
          },
        },
      ],
    };
  }, [travelStats]);

  // ── View: category (카테고리 분류) ────────────────────────────────────────
  const categoryOption = useMemo(() => {
    const names = travelStats.map((s) => shortenName(s.period.name));

    const series = CATEGORY_KEYS.map((cat) => ({
      name: cat,
      type: "bar",
      stack: "total",
      data: travelStats.map((s) => s.catAmounts[cat] ?? 0),
      itemStyle: {
        color: CATEGORY_RULES[cat].hex,
        borderRadius: cat === CATEGORY_KEYS[CATEGORY_KEYS.length - 1]
          ? [0, 6, 6, 0]
          : [0, 0, 0, 0],
      },
      emphasis: { focus: "series" },
    }));

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(12,12,18,0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: { seriesName: string; value: number; color: string }[]) => {
          const nonZero = params.filter((p) => p.value > 0);
          if (nonZero.length === 0) return "";
          const total = nonZero.reduce((s, p) => s + p.value, 0);
          let html = `<b>${travelStats[params[0] ? 0 : 0]?.period.name ?? ""}</b> 총 ${total.toLocaleString()}원<br/>`;
          nonZero.forEach((p) => {
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color};margin-right:6px"></span>`;
            html += `${p.seriesName}: <b>${p.value.toLocaleString()}원</b><br/>`;
          });
          return html;
        },
      },
      legend: {
        data: CATEGORY_KEYS,
        bottom: 0,
        textStyle: { color: "rgba(255,255,255,0.5)", fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10,
        icon: "roundRect",
      },
      grid: { left: "2%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
        axisLabel: {
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          formatter: (v: number) => fmtWon(v),
        },
      },
      yAxis: {
        type: "category",
        data: names,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
      },
      series,
    };
  }, [travelStats]);

  const chartHeight = Math.max(180, travelStats.length * 56 + 60);

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-500" />
            여행별 지출
            {hasData && (
              <Badge variant="secondary" className="text-xs font-mono">
                {travelStats.length}개 여행
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            {([["compare", "총 지출"], ["category", "카테고리"]] as [View, string][]).map(([v, label]) => (
              <Badge
                key={v}
                variant={view === v ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer text-xs px-2.5 py-1 transition-all",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setView(v)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-muted-foreground">
            <Plane className="w-9 h-9 opacity-20" />
            <p className="text-sm">여행에 태깅된 지출이 없습니다</p>
            <p className="text-xs opacity-60">거래 내역에서 여행 추가 후 지출을 묶어주세요</p>
          </div>
        ) : (
          <>
            <ReactECharts
              option={view === "compare" ? compareOption : categoryOption}
              style={{ height: chartHeight }}
              notMerge
            />

            {/* 요약 테이블 */}
            <div className="mt-3 border-t border-border/50 pt-3 space-y-1.5">
              {travelStats.map(({ period, total, txCount }) => {
                const budgetPct = period.budget ? Math.round((total / period.budget) * 100) : null;
                const over = budgetPct != null && budgetPct >= 100;
                return (
                  <div key={period.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-sky-500/60 shrink-0" />
                    <span className="text-foreground font-medium truncate flex-1">{period.name}</span>
                    <span className="text-muted-foreground">{txCount}건</span>
                    {budgetPct != null && (
                      <span className={cn("font-mono", over ? "text-red-400" : "text-muted-foreground")}>
                        {budgetPct}%
                      </span>
                    )}
                    <span className="font-bold font-mono text-sky-400 shrink-0">
                      {total.toLocaleString()}원
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
