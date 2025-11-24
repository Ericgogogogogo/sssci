"use client";
import Link from "next/link";
import { useUIStore } from "@/store/ui";

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  return (
    <aside className={`h-screen border-r border-zinc-200 dark:border-zinc-800 ${sidebarCollapsed ? "w-16" : "w-64"} px-3 py-4`}> 
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold">SSSCI</Link>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-sm text-zinc-600 dark:text-zinc-300">{sidebarCollapsed ? ">" : "<"}</button>
      </div>
      <nav className="space-y-2 text-sm">
        <Link className="block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/projects">我的项目</Link>
        <Link className="block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/projects/new">新建项目</Link>
        <Link className="block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/dashboard">使用统计</Link>
        <Link className="block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/settings">设置</Link>
        <Link className="block rounded px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="/admin">管理面板</Link>
      </nav>
      <div className="mt-auto pt-6 text-xs text-zinc-600 dark:text-zinc-400">
        <p>订阅：<span className="font-medium">FREE</span></p>
        <p>剩余生成：5/月</p>
      </div>
    </aside>
  );
}