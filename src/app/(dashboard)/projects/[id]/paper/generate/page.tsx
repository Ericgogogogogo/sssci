"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function PaperGeneratePage({ params, searchParams }: { params: { id: string }; searchParams: { [key: string]: string } }) {
  const t = useTranslations("paper");
  const [stage, setStage] = useState<string>("idle");
  const [paper, setPaper] = useState<any>(null);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const started = useRef(false);
  const resultsRef = useRef<any>(null);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = async () => {
      setStage("starting");
      try {
        const cached = localStorage.getItem(`paper:results:${params.id}`);
        resultsRef.current = cached ? JSON.parse(cached) : {};
      } catch { resultsRef.current = {}; }
      const res = await fetch("/api/modules/paper/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: params.id, results: resultsRef.current }) });
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        const lines = chunk.split("\n").filter(Boolean);
        for (const ln of lines) {
          if (ln.startsWith("data:")) {
            const data = JSON.parse(ln.slice(5));
            if (data.stage) { setStage(data.stage); setProgressMsg(t(`stage_${data.stage}`)); }
            if (data.paper) { setPaper(data.paper); }
          }
        }
      }
      setStage("completed");
      if (paper) {
        const recRes = await fetch("/api/modules/journals/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: paper.title, method: "QUANTITATIVE", field: "AI", score: 6 }) });
        const recData = await recRes.json();
        setRecommendations(recData.recommendations);
      }
    };
    start().catch(() => setError("paper.errors.server_error"));
  }, [t, paper]);
  const downloadHtml = async () => {
    if (!paper) return;
    const res = await fetch("/api/modules/paper/export/html", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paper, title: paper.title }) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${paper.title}.html`; a.click();
    URL.revokeObjectURL(url);
  };
  const downloadWord = async () => {
    if (!paper) return;
    const res = await fetch("/api/modules/paper/export/word", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paper, title: paper.title }) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${paper.title}.doc`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("generate_title")}</h1>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{progressMsg}</div>
      {error && <div className="text-sm text-red-600">{t(error)}</div>}
      {paper && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border p-4">
            <div className="text-sm">{t("preview")}</div>
            <div className="prose prose-zinc max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: paper.markdown.replace(/\n/g, "<br/>") }} />
            <div className="mt-3 flex gap-2">
              <button onClick={downloadHtml} className="rounded-md bg-black text-white px-3 py-1 text-sm dark:bg-white dark:text-black">{t("export_html")}</button>
              <button onClick={downloadWord} className="rounded-md border px-3 py-1 text-sm">{t("export_word")}</button>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm">{t("journals_title")}</div>
            {recommendations ? (
              <div className="space-y-2">
                {recommendations.primary.concat(recommendations.secondary).map((j: any) => (
                  <div key={j.name} className="rounded-md border p-2">
                    <div className="font-medium">{j.name}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">IF {j.impactFactor} · {j.acceptanceRate}</div>
                    <div className="text-xs">{j.reason}</div>
                    <div className="text-xs">{j.suggestions}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-600 dark:text-zinc-400">{t("journals_loading")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}