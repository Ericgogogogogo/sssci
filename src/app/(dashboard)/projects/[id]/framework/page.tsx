"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

type Topic = { name?: string; title?: string; description?: string };
type Framework = {
  id: string; name: string; description: string; coreTheories: string[];
  hypotheses: { id: string; statement: string; rationale: string }[];
  literatureSupport: { title: string }[];
  innovation: number; rigor: number; academic: number; overall: number; pros: string[]; cons: string[];
};

export default function FrameworkPage() {
  const p = useParams<{ id: string }>();
  const id = (p?.id ?? "") as string;
  const t = useTranslations("framework");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [desc, setDesc] = useState("");
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [active, setActive] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch(`/api/modules/topic/latest?projectId=${id}`).then(r => r.json()).then(d => {
      const rec = d.record;
      const idx = rec?.selectedTopicId ? Number(rec.selectedTopicId) : 0;
      const tp = (rec?.generatedTopics ?? [])[idx] ?? null;
      setTopic(tp);
    });
  }, [id]);

  const generate = async () => {
    setProgress(t("generating"));
    setError("");
    const res = await fetch(`/api/modules/framework/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, userDescription: desc, iteration: 1 }) });
    const data = await res.json();
    if (!res.ok) {
      setProgress("");
      setError(String(data?.detail ?? data?.error ?? t("generate_failed")));
      return;
    }
    setFrameworks(data.frameworks ?? []);
    setActive(0);
    setSelected(null);
    setProgress("");
  };

  const selectFramework = async (i: number) => {
    setSelected(i);
    await fetch(`/api/modules/framework/select`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, selectedFrameworkId: String(i) }) });
  };

  const nodes = (frameworks[active]?.coreTheories ?? []).map((c, i) => ({ id: String(i+1), data: { label: c }, position: { x: 50 + i*120, y: 50 } }));
  const edges = nodes.slice(1).map((n, i) => ({ id: `e${i}`, source: String(i+1), target: n.id }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="rounded border p-4 space-y-2">
        <div className="text-sm text-zinc-600">{t("selected_topic")}</div>
        <details>
          <summary className="font-medium">{topic?.name ?? topic?.title ?? "-"}</summary>
          <p className="text-sm mt-1">{topic?.description}</p>
        </details>
      </div>
      <div className="rounded border p-4 space-y-2">
        <div className="text-sm text-zinc-600">{t("user_desc")}</div>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} className="w-full rounded border px-3 py-2 text-sm" placeholder={t("desc_placeholder")} />
        <div className="flex justify-end">
          <button onClick={generate} className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">{t("generate_btn")}</button>
        </div>
        {progress && <div className="text-sm text-zinc-600">{progress}</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      {frameworks.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {frameworks.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`rounded border px-2 py-1 text-sm ${active===i?'bg-zinc-100 dark:bg-zinc-800':''}`}>{t("tab")} {i+1}</button>
            ))}
          </div>
          <div className={`rounded border p-4 ${selected!=null && selected!==active ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{frameworks[active]?.name}</div>
              <button onClick={() => selectFramework(active)} disabled={selected!=null} className="rounded border px-2 py-1 text-xs">{selected===active ? t("selected") : t("select")}</button>
            </div>
            <p className="text-sm mt-2">{frameworks[active]?.description}</p>
            <div className="h-40 mt-2 rounded border">
              <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
                <Controls />
              </ReactFlow>
            </div>
            <div className="mt-2">
              <div className="text-xs">{t("hypotheses")}</div>
              <ul className="mt-1 space-y-1">
                {frameworks[active]?.hypotheses?.map((h) => <li key={h.id} className="text-sm">{h.id}: {h.statement} — {h.rationale}</li>)}
              </ul>
            </div>
            <div className="mt-2">
              <div className="text-xs">{t("pros_cons")}</div>
              <div className="flex gap-2 mt-1">
                {frameworks[active]?.pros?.map((p, i) => <span key={i} className="rounded bg-green-100 px-2 py-0.5 text-xs dark:bg-green-900/30 dark:text-green-300">{p}</span>)}
                {frameworks[active]?.cons?.map((c, i) => <span key={i} className="rounded bg-amber-100 px-2 py-0.5 text-xs dark:bg-amber-900/30 dark:text-amber-300">{c}</span>)}
              </div>
            </div>
          </div>
          {selected!=null && <div className="flex justify-end"><a href={`/projects/${id}/review/setup`} className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">{t("next")}</a></div>}
        </div>
      )}
    </div>
  );
}