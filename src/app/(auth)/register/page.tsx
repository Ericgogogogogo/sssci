"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/lib/auth/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

type RegisterValues = z.infer<typeof RegisterSchema>;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [errKey, setErrKey] = useState<string | null>(null);
  const [okKey, setOkKey] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(RegisterSchema) });
  const pw = watch("password", "");
  const strength = passwordStrength(pw);

  const onSubmit = async (values: RegisterValues) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, password: values.password, name: values.name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrKey(data?.error ?? "auth.errors.register_failed");
      return;
    }
    setOkKey("auth.messages.register_success");
    setTimeout(() => router.push("/login"), 800);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">{t("register")}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">SSSCI</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" placeholder="张三" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{t(errors.name.message as string)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{t(errors.email.message as string)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" placeholder="至少 8 位，含大小写与数字" {...register("password")} />
            <div className="h-2 w-full rounded bg-zinc-200 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  backgroundColor: strength < 3 ? "#ef4444" : strength < 4 ? "#f59e0b" : "#22c55e",
                }}
              />
            </div>
            {errors.password && <p className="text-xs text-red-600">{t(errors.password.message as string)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input id="confirmPassword" type="password" placeholder="再次输入密码" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-600">{t(errors.confirmPassword.message as string)}</p>}
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2">
              <Checkbox {...register("agree")} />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t("agree")}</span>
            </label>
            <a href="/login" className="text-sm text-zinc-900 hover:underline dark:text-zinc-100">{t("hasAccount")}</a>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("loading.register") : t("register")}
          </Button>
        </form>
        {errKey && <div className="mt-3 text-sm text-red-600">{t(errKey)}</div>}
        {okKey && <div className="mt-3 text-sm text-green-600">{t(okKey)}</div>}
      </div>
    </div>
  );
}