import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

interface StockChartProps {
  symbol: string;
  chartData: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export const StockChart = ({ symbol, chartData }: StockChartProps) => {
  const parseKoreanTime = (timeStr: string): string => {
    const match = timeStr.match(/(오전|오후)\s*(\d+):(\d+):(\d+)/);
    if (!match) return timeStr;

    let [, ampm, hoursStr, minutes] = match;
    let hours = parseInt(hoursStr);
    if (ampm === "오후" && hours < 12) hours += 12;
    if (ampm === "오전" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const dates = chartData.map((item) => parseKoreanTime(item.time));
  const prices = chartData.map((bar) => bar.close);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(12, 12, 18, 0.95)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      textStyle: { color: "#f1f5f9", fontSize: 12 },
      formatter: (params: any[]) => {
        const data = params[0];
        return `<b style="color:#94a3b8">${symbol}</b><br/>시간: ${data.name}<br/>가격: <b style="color:#4ade80">$${data.value}</b>`;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "6%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
      axisLabel: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        formatter: (value: number) => `$${value}`,
      },
    },
    series: [
      {
        name: symbol,
        type: "line",
        data: prices,
        symbol: "none",
        sampling: "lttb",
        smooth: 0.3,
        itemStyle: { color: "#4ade80" },
        lineStyle: { width: 2, type: "solid", color: "#4ade80" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(74, 222, 128, 0.2)" },
            { offset: 1, color: "rgba(74, 222, 128, 0)" },
          ]),
        },
        markPoint: {
          data: [
            { type: "max", name: "최고가", itemStyle: { color: "#f87171" } },
            { type: "min", name: "최저가", itemStyle: { color: "#4ade80" } },
          ],
          label: {
            fontSize: 10,
            formatter: (param: any) => `$${param.value.toFixed(1)}`,
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};
