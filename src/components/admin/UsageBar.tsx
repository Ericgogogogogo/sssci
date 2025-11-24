"use client";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function UsageBar({ topics, frameworks, reviews }: { topics: number; frameworks: number; reviews: number }) {
  const labels = ["Topic", "Framework", "Review"];
  const values = [topics, frameworks, reviews];
  return (
    <Bar
      data={{ labels, datasets: [{ label: "当前月使用总计", data: values, backgroundColor: ["#22c55e", "#2563eb", "#f59e0b"] }] }}
      options={{ responsive: true, plugins: { legend: { display: false } } }}
    />
  );
}