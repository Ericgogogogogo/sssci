"use client";
import React from "react";

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : status === "ARCHIVED" ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${color}`}>{label}</span>;
}