"use client";
import React from "react";
import { useTranslations } from "next-intl";

export function UsageProgress({ remaining, limit }: { remaining: number; limit: number }) {
  const t = useTranslations("usage");
  const used = Math.max(0, limit - remaining);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="space-y-2">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("messages.limit_remaining")}: {remaining}/{limit}</div>
      <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-blue-600 dark:bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}