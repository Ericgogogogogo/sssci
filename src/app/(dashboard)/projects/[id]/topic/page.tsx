"use client";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type GeneratedTopic = {
  name: string; description: string; innovation_score: number; rigor_score: number; academic_score: number; pros: string[]; cons: string[]; overall_score: number;
};

export default function TopicPage() {
  const p = useParams<{ id: string }>();
  const id = (p?.id ?? "") as string;
  const t = useTranslations("topic");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [field, setField] = useState("AI");
  const [iteration, setIteration] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [polled, setPolled] = useState<GeneratedTopic[] | null>(null)

  const genMutation = useMutation<{ topics: GeneratedTopic[]; iteration: number; remainingAttempts: number | null }, any>({
    mutationFn: async () => {
      const res = await fetch("/api/modules/topic/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, keywords, description: input, field, iteration }) });
      if (res.status === 202) {
        const data = await res.json();
        throw new Error(data?.message ?? "生成时间较长，请稍候...");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "error");
      return data;
    },
  });

  useEffect(() => { if (genMutation.isSuccess) document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }); }, [genMutation.isSuccess]);
  useEffect(() => {
    let timer: any
    if (genMutation.isError) {
      let attempts = 0
      timer = setInterval(async () => {
        attempts++
        const res = await fetch(`/api/modules/topic/latest?projectId=${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.record?.generatedTopics?.length) {
            setPolled(data.record.generatedTopics)
            clearInterval(timer)
          }
        }
        if (attempts > 15) clearInterval(timer)
      }, 2000)
    }
    return () => { if (timer) clearInterval(timer) }
  }, [genMutation.isError, id])

  const radarData = (t: GeneratedTopic) => [
    { metric: "Innovation", score: t.innovation_score },
    { metric: "Rigor", score: t.rigor_score },
    { metric: "Academic", score: t.academic_score },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("form.title")}</div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((k, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
              {k}
              <button onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))} className="text-zinc-500">×</button>
            </span>
          ))}
          <input onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v) setKeywords([...keywords, v]); (e.target as HTMLInputElement).value = ""; } }} className="rounded-md border px-2 py-1 text-sm" placeholder={t("form.keywords_placeholder")} />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" rows={6} placeholder={t("form.description_placeholder")} />
        <div className="flex gap-2">
          <select value={field} onChange={(e) => setField(e.target.value)} className="rounded-md border px-2 py-1 text-sm">
            {["AI","Biology","Economics","Education"].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button onClick={() => genMutation.mutate()} disabled={genMutation.isPending} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black">
            {genMutation.isPending ? t("form.generating") : t("form.generate_btn")} {genMutation.data?.remainingAttempts != null ? `(${genMutation.data.remainingAttempts})` : ""}
          </button>
        </div>
        {genMutation.isError && <div className="text-sm text-amber-600">生成时间较长，请稍候...</div>}
      </div>
      <div id="results" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(polled ?? genMutation.data?.topics ?? []).map((topic, idx) => (
          <div key={idx} className={`rounded-lg border p-4 ${selected != null && selected !== idx ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">{topic.name}</div>
              <button onClick={() => setSelected(idx)} disabled={selected != null} className="rounded-md border px-2 py-1 text-xs">{selected === idx ? t("selected") : t("select")}</button>
            </div>
            <details className="mt-2">
              <summary className="text-sm text-zinc-600 dark:text-zinc-400">{t("show_description")}</summary>
              <p className="text-sm mt-1">{topic.description}</p>
            </details>
            <div className="h-48 mt-2">
              <ResponsiveContainer>
                <RadarChart data={radarData(topic)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2">
              <div className="text-xs text-green-700">{t("pros")}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {topic.pros.map((p, i) => <span key={i} className="rounded bg-green-100 px-2 py-0.5 text-xs dark:bg-green-900/30 dark:text-green-300">{p}</span>)}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-amber-700">{t("cons")}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {topic.cons.map((c, i) => <span key={i} className="rounded bg-amber-100 px-2 py-0.5 text-xs dark:bg-amber-900/30 dark:text-amber-300">{c}</span>)}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs">{t("overall_score")}</div>
              <div className="h-2 w-full rounded bg-zinc-200 overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${(topic.overall_score / 10) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
  {selected != null && <div className="flex justify-end gap-2">
        <button onClick={async () => { await fetch("/api/modules/topic/select", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, selectedTopicId: String(selected) }) }); }} className="rounded-md border px-4 py-2 text-sm">{t("selected")}</button>
        <a href={`/projects/${id}/next`} className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black">{t("next_step")}</a>
  </div>}
  </div>
  );
}