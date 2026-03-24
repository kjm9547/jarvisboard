import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts"; // ECharts 테마나 추가 기능을 위해 필요

interface StockChartProps {
  symbol: string; // 예: "AAPL"
  chartData: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}
type stock = StockChartProps["chartData"];

export const StockChart = ({ symbol, chartData }: StockChartProps) => {
  const parseKoreanTime = (timeStr: any) => {
    // 예: "오후 5:30:15" -> ["오후", "5", "30", "15"]
    const match = timeStr.match(/(오전|오후)\s*(\d+):(\d+):(\d+)/);

    if (!match) return timeStr; // 형식이 맞지 않으면 그대로 반환

    let [, ampm, hours, minutes, seconds] = match;
    hours = parseInt(hours);

    // 오후 12시는 12시, 오후 1~11시는 13~23시로 변환
    if (ampm === "오후" && hours < 12) hours += 12;
    // 오전 12시는 0시로 변환
    if (ampm === "오전" && hours === 12) hours = 0;

    // ECharts에서 보기 좋게 "HH:mm" 형식으로 리턴
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };
  // 차트에 그릴 X축(시간)과 Y축(가격) 데이터 추출
  const dates = chartData.map((item) => parseKoreanTime(item.time));
  const prices = chartData.map((bar) => bar.close); // 종가를 Y축 데이터로 사용

  const option = {
    // 차트 제목 및 스타일

    // 마우스 호버 시 툴팁 설정
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross", // 십자가 포인터
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#e2e8f0", // slate-200
      borderWidth: 1,
      textStyle: { color: "#0f172a" }, // slate-900
      formatter: function (params) {
        const data = params[0];
        return `<b>${symbol}</b><br/>시간: ${data.name}<br/>가격: <b>$${data.value}</b>`;
      },
    },
    // 차트 여백 설정
    grid: {
      left: "3%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    // X축 설정 (시간)
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false, // 선이 축 끝까지 차게 함
      axisLine: { lineStyle: { color: "#cbd5e1" } }, // slate-300
      axisLabel: { color: "#64748b" }, // slate-500
    },
    // Y축 설정 (가격)
    yAxis: {
      type: "value",
      scale: true, // 가격 범위에 맞춰 축 스케일 자동 조절 (중요!)
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#373737" } }, // slate-100 (가로 그리드 선)
      axisLabel: {
        color: "#64748b",
        formatter: (value) => `$${value}`, // 가격 앞에 $ 붙임
      },
    },
    // 3. 실제 데이터 시리즈 설정 (라인 차트)
    series: [
      {
        name: symbol,
        type: "line",
        data: prices,
        symbol: "none", // 선 위에 점 숨기기 (깔끔함)
        sampling: "lttb", // 데이터가 많을 때 다운샘플링하여 성능 향상
        itemStyle: {
          color: "#357232", // indigo-600 (메인 선 색상)
        },
        lineStyle: {
          width: 2,
          type: "solid",
        },
        // 선 아래 영역 채우기 (Gradiant 효과)
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(34, 171, 71, 0.3)" }, // indigo-600 투명도 30%
            { offset: 1, color: "rgba(79, 70, 229, 0)" }, // 하단은 투명하게
          ]),
        },
        // 최고가/최저가 표시 마크 포인트
        markPoint: {
          data: [
            { type: "max", name: "최고가", itemStyle: { color: "#ef4444" } }, // red-500
            { type: "min", name: "최저가", itemStyle: { color: "#22c55e" } }, // green-500
          ],
          label: {
            fontSize: 10,
            formatter: (param) => `$${param.value.toFixed(1)}`,
          },
        },
      },
    ],
  };
  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge={true} // 데이터 업데이트 시 기존 옵션과 합치지 않음
      lazyUpdate={true} // 성능을 위해 지연 업데이트 사용
    />
  );
};
