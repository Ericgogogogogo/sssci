"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ReviewSetupPage() {
  const p = useParams<{ id: string }>();
  const id = (p?.id ?? "") as string;
  const router = useRouter();
  const t = useTranslations("review_setup");
  const [totalWords, setTotalWords] = useState(9000);
  const [referenceCount, setReferenceCount] = useState(30);
  const [structure, setStructure] = useState("标准");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const start = async () => {
    setLoading(true);
    const res = await fetch("/api/modules/review/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, settings: { totalWords, referenceCount, structure }, userInput }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(String(data?.detail ?? data?.error ?? "创建失败")); return; }
    router.push(`/projects/${id}/review/generate?reviewId=${data.reviewId}`);
  };
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">文献综述设置</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm">总字数</label>
          <select value={totalWords} onChange={(e) => setTotalWords(Number(e.target.value))} className="rounded-md border px-2 py-1">
            {[9000, 12000, 15000].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm">参考文献数量</label>
          <select value={referenceCount} onChange={(e) => setReferenceCount(Number(e.target.value))} className="rounded-md border px-2 py-1">
            {[30, 50, 80].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm">章节结构</label>
          <select value={structure} onChange={(e) => setStructure(e.target.value)} className="rounded-md border px-2 py-1">
            {["标准", "自定义"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm">补充描述</label>
          <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} rows={6} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="添加对综述的要求" />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={start} disabled={loading} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black">开始生成</button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}