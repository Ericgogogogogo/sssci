"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function SettingsClient({ plan, status, usage, remainingTopic }: { plan: string; status: string; usage: any; remainingTopic: number | typeof Infinity }) {
  const t = useTranslations("settings");
  const ts = useTranslations("stripe");
  const [msgKey, setMsgKey] = useState<string | null>(null);
  const [errKey, setErrKey] = useState<string | null>(null);

  const upgrade = async (p: "PRO" | "TEAM") => {
    setMsgKey(null); setErrKey(null);
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planType: p }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErrKey(data?.error ?? "stripe.errors.server_error"); return; }
    if (data?.url) location.href = data.url;
  };
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("currentPlan")}</div>
          <div className="mt-1 text-xl font-semibold">{plan}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("status")}：{status}</div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => upgrade("PRO")}>{t("upgradePro")}</Button>
            <Button onClick={() => upgrade("TEAM")} variant="outline">{t("upgradeTeam")}</Button>
          </div>
          {errKey && <div className="mt-3 text-sm text-red-600">{ts(errKey)}</div>}
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("usageStats")}</div>
          <div className="mt-2 text-sm">{t("topicRemaining")}: {remainingTopic === Infinity ? t("unlimited") : `${remainingTopic}/5`}</div>
          <div className="text-sm">{t("frameworkUsed")}: {usage?.frameworkGenerationsUsed ?? 0}</div>
          <div className="text-sm">{t("reviewUsed")}: {usage?.reviewSectionsUsed ?? 0}</div>
        </div>
      </div>
    </div>
  );
}