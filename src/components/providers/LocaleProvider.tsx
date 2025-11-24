"use client";
import { NextIntlClientProvider } from "next-intl";

export function LocaleProvider({ children, messages, locale }: { children: React.ReactNode; messages: any; locale: string }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
  );
}