"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("zh");

  // 避免SSR水合问题
  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    setCurrentLocale(match?.[1] ?? "zh");
  }, []);

  const handleLanguageChange = (locale: "zh" | "en") => {
    document.cookie = `locale=${locale}; path=/`;
    setCurrentLocale(locale);
    // 触发重新加载以应用新语言
    window.location.reload();
  };

  // 主题切换前先等待客户端挂载
  if (!mounted) {
    return (
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">/ 仪表盘</div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-9 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-9 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-9 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">/ 仪表盘</div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌞" : "🌙"} {theme === "dark" ? "浅色" : "深色"}
        </Button>
        <Button
          variant={currentLocale === "zh" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleLanguageChange("zh")}
        >
          中文
        </Button>
        <Button
          variant={currentLocale === "en" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleLanguageChange("en")}
        >
          EN
        </Button>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>登出</Button>
      </div>
    </header>
  );
}