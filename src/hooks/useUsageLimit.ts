"use client";
import { useCallback, useState } from "react";

type Result = {
  canUse: boolean;
  remaining: number | null;
  limit: number | null;
  upgrade?: "PRO" | "TEAM";
  error?: string;
};

export function useUsageLimit(feature: "topic_generation" | "framework_generation" | "review_generation") {
  const [state, setState] = useState<Result>({ canUse: true, remaining: null, limit: null });
  const check = useCallback(async () => {
    const res = await fetch("/api/usage/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setState({ canUse: false, remaining: 0, limit: 0, error: data.error, upgrade: data.upgrade });
    } else {
      setState({ canUse: true, remaining: data.remaining ?? null, limit: data.limit ?? null });
    }
    return data;
  }, [feature]);
  return { ...state, check };
}