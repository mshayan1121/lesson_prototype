"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineSeriesOptions,
} from "lightweight-charts";

interface SimChartProps {
  points: number[];
  startPrice: number;
  months: string[];
}

// Base year for x-axis time values
const BASE_YEAR = 2024;

function monthToTime(index: number): string {
  const month = (index + 1).toString().padStart(2, "0");
  return `${BASE_YEAR}-${month}-01`;
}

export default function SimChart({ points, startPrice, months: _months }: SimChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 220,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#9ca3af",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#F3F4F6" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: false,
        tickMarkFormatter: (time: number) => {
          // time comes in as Unix seconds for business day mode
          // We're using calendar dates so just show abbreviated month
          const d = new Date(time * 1000);
          return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
        },
      },
      crosshair: {
        vertLine: { color: "#639922", width: 1, style: 2 },
        horzLine: { color: "#639922", width: 1, style: 2 },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: "#3B6D11",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    } as Partial<LineSeriesOptions>);

    seriesRef.current = series;

    // Seed with start price at month 0 so chart is never empty
    series.setData([{ time: monthToTime(0) as import("lightweight-charts").Time, value: startPrice }]);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 220,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update series data whenever points changes
  useEffect(() => {
    if (!seriesRef.current) return;

    if (points.length === 0) {
      seriesRef.current.setData([
        { time: monthToTime(0) as import("lightweight-charts").Time, value: startPrice },
      ]);
    } else {
      const data = points.map((price, i) => ({
        time: monthToTime(i) as import("lightweight-charts").Time,
        value: price,
      }));
      seriesRef.current.setData(data);

      // Update line color based on trend
      const currentPrice = points[points.length - 1];
      const isUp = currentPrice >= startPrice;
      seriesRef.current.applyOptions({
        color: isUp ? "#16a34a" : "#ef4444",
      });
    }

    chartRef.current?.timeScale().fitContent();
  }, [points, startPrice]);

  return <div ref={containerRef} className="w-full h-full" />;
}
