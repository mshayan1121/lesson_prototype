"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
} from "lightweight-charts";

const AAPL_DATA = [
  { time: "2019-01-01", value: 47 },
  { time: "2020-01-01", value: 73 },
  { time: "2021-01-01", value: 148 },
  { time: "2022-01-01", value: 130 },
  { time: "2023-01-01", value: 193 },
  { time: "2024-01-01", value: 220 },
  { time: "2025-01-01", value: 245 },
];

export default function AaplChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#9ca3af",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { color: "#639922", width: 1, style: 2 },
        horzLine: { color: "#639922", width: 1, style: 2 },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    // v5 API: chart.addSeries(AreaSeries, options)
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3B6D11",
      topColor: "#EAF3DE",
      bottomColor: "rgba(234,243,222,0)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    series.setData(AAPL_DATA);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ height: 300 }} />
  );
}
