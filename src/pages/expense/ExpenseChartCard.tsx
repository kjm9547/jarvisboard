import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactECharts from "echarts-for-react";

type Period = "daily" | "weekly" | "monthly";

interface Props {
  dailyStats: [string, number][];
  weeklyStats: [string, number][];
  monthlyStats: [string, number][];
}

const formatLabel = (key: string, period: Period): string => {
  if (period === "daily") return key.slice(5); // MM-DD
  if (period === "weekly") return key.slice(5) + " 주";
  return key; // YYYY-MM
};

const periodLabels: Record<Period, string> = {
  daily: "일별",
  weekly: "주별",
  monthly: "월별",
};

export const ExpenseChartCard = ({ dailyStats, weeklyStats, monthlyStats }: Props) => {
  const [period, setPeriod] = useState<Period>("monthly");

  const statsMap: Record<Period, [string, number][]> = {
    daily: dailyStats,
    weekly: weeklyStats,
    monthly: monthlyStats,
  };

  const stats = statsMap[period];
  const labels = stats.map(([k]) => formatLabel(k, period));
  const values = stats.map(([, v]) => v);
  const maxVal = Math.max(...values, 1);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(12,12,18,0.95)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      textStyle: { color: "#f1f5f9", fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/><b style="color:#f87171">${p.value.toLocaleString()}원</b>`;
      },
    },
    grid: { left: "2%", right: "2%", bottom: "3%", top: "8%", containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
      axisLabel: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 10,
        formatter: (v: number) =>
          v >= 10000 ? `${(v / 10000).toFixed(0)}만` : `${v}`,
      },
    },
    series: [
      {
        type: "bar",
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color:
              v === maxVal
                ? "rgba(248,113,113,0.9)"
                : "rgba(248,113,113,0.45)",
            borderRadius: [6, 6, 0, 0],
          },
        })),
        emphasis: {
          itemStyle: { color: "rgba(248,113,113,1)" },
        },
        barMaxWidth: 48,
      },
    ],
  };

  return (
    <Card className="rounded-2xl border-border bg-white/5 shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            지출 통계
          </CardTitle>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <Badge
                key={p}
                variant={period === p ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer text-xs px-2.5 py-1 transition-all",
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            데이터가 없습니다
          </div>
        ) : (
          <ReactECharts option={option} style={{ height: 240 }} notMerge />
        )}
      </CardContent>
    </Card>
  );
};
