"use client";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import zh from "@/i18n/locales/zh.json";
import en from "@/i18n/locales/en.json";
import { useEffect, useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>("zh");
  const [messages, setMessages] = useState<any>(zh);

  // 使用useMemo避免每次都创建新的QueryClient
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分钟
        refetchOnWindowFocus: false,
      },
    },
  }), []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    const l = match?.[1] ?? "zh";
    setLocale(l);
    setMessages(l === "en" ? en : zh);
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Shanghai">
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}