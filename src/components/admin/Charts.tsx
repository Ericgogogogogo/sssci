"use client";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

export function RoleChart({ data }: { data: Record<string, number> }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  return <Doughnut data={{ labels, datasets: [{ data: values, backgroundColor: ["#020617", "#1e293b", "#64748b", "#94a3b8"] }] }} />;
}

export function PlanChart({ data }: { data: Record<string, number> }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  return <Doughnut data={{ labels, datasets: [{ data: values, backgroundColor: ["#16a34a", "#2563eb", "#f59e0b"] }] }} />;
}