"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/auth/schemas";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

type LoginValues = z.output<typeof LoginSchema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [errKey, setErrKey] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(LoginSchema), defaultValues: { remember: true } });

  const onSubmit = async (values: LoginValues) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    if (res?.error) {
      // 移除auth.前缀，因为useTranslations已经限定在auth命名空间
      const errorKey = res.error === "CredentialsSignin" ? "errors.credentials_invalid" : "errors.login_failed";
      setErrKey(errorKey);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">{t("login")}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">SSSCI</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{t(errors.email.message as string)}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600">{t(errors.password.message as string)}</p>}
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2">
              <Checkbox {...register("remember")} />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t("remember")}</span>
            </label>
            <a href="/register" className="text-sm text-zinc-900 hover:underline dark:text-zinc-100">{t("noAccount")}</a>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("loading.login") : t("login")}
          </Button>
        </form>
        {errKey && <div className="mt-3 text-sm text-red-600">{t(errKey)}</div>}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google")}
          >
            {t("google")}
          </Button>
        </div>
      </div>
    </div>
  );
}