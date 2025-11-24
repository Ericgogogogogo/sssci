"use client";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrendChart({ labels, values, title }: { labels: string[]; values: number[]; title: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm">{title}</div>
      <Line
        data={{ labels, datasets: [{ label: title, data: values, borderColor: "#2563eb", backgroundColor: "#93c5fd" }] }}
        options={{ responsive: true, plugins: { legend: { display: false } } }}
      />
    </div>
  );
}