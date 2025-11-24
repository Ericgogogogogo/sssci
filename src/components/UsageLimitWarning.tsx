"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function UsageLimitWarning({ remaining, limit, onUpgrade }: { remaining: number; limit: number; onUpgrade?: () => void }) {
  const t = useTranslations("usage");
  return (
    <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
      <div>
        <p className="text-sm">{t("messages.limit_remaining")}：{remaining}/{limit}</p>
        <p className="text-xs">{t("messages.upgrade_cta")}</p>
      </div>
      <Button size="sm" onClick={onUpgrade}>{t("messages.upgrade_go")}</Button>
    </div>
  );
}