"use client";
import { Button } from "@/components/ui/button";

export function UserRow({ user }: { user: { id: string; email: string; name?: string | null; role: string; subscription?: { status: string | null; planType: string | null } | null } }) {
  const resetUsage = async () => {
    const res = await fetch("/api/admin/usage/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json().catch(() => ({}));
    alert(res.ok ? "已重置使用次数" : data?.error ?? "操作失败");
  };

  const createCheckout = async (planType: "PRO" | "TEAM") => {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.url) location.href = data.url; else alert(data?.error ?? "创建失败");
  };

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-800">
      <td className="px-3 py-2 text-sm">{user.name ?? "-"}</td>
      <td className="px-3 py-2 text-sm">{user.email}</td>
      <td className="px-3 py-2 text-sm">{user.role}</td>
      <td className="px-3 py-2 text-sm">{user.subscription?.planType ?? "-"}</td>
      <td className="px-3 py-2 text-sm">{user.subscription?.status ?? "-"}</td>
      <td className="px-3 py-2 text-sm flex gap-2">
        <Button size="sm" variant="outline" onClick={resetUsage}>重置使用</Button>
        <Button size="sm" onClick={() => createCheckout("PRO")}>升级 PRO</Button>
      </td>
    </tr>
  );
}