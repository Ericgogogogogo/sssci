"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function PaperSetupPage({ params }: { params: { id: string } }) {
  const t = useTranslations("paper");
  const router = useRouter();
  const [figures, setFigures] = useState<Array<{ name: string; type: string; dataUrl: string }>>([]);
  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr: Array<{ name: string; type: string; dataUrl: string }> = [];
    for (const f of Array.from(files)) {
      const reader = new FileReader();
      const p = new Promise<string>((res) => { reader.onload = () => res(String(reader.result)); });
      reader.readAsDataURL(f);
      const dataUrl = await p;
      arr.push({ name: f.name, type: f.type, dataUrl });
    }
    setFigures(arr);
    try { localStorage.setItem(`paper:results:${params.id}`, JSON.stringify({ figures: arr })); } catch {}
  };
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("setup_title")}</h1>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm">{t("upload_results")}</div>
        <input type="file" accept="image/png,application/pdf" multiple onChange={(e) => onFiles(e.target.files)} />
      </div>
      <div className="flex justify-end">
        <button className="rounded-md bg-black text-white px-4 py-2 dark:bg-white dark:text-black" onClick={() => router.push(`/projects/${params.id}/paper/generate`)}>{t("start_generate")}</button>
      </div>
    </div>
  );
}