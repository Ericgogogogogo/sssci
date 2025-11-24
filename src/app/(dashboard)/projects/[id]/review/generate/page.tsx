"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function mdToHtml(md: string) {
  return md
    .replace(/^#\s(.+)$/gm, '<h2>$1</h2>')
    .replace(/^\-\s(.+)$/gm, '<p>• $1</p>')
    .replace(/\n\n/g, '<br/>');
}

export default function ReviewGeneratePage() {
  const p = useParams<{ id: string }>();
  const id = (p?.id ?? "") as string;
  const sp = useSearchParams();
  const reviewId = sp?.get("reviewId");
  const [review, setReview] = useState<any>(null);
  const [current, setCurrent] = useState<any>(null);
  const [progress, setProgress] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [refs, setRefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reviewId) return;
    fetch(`/api/modules/review/${reviewId}`).then(r => r.json()).then(d => {
      setReview(d.review);
      const sec = d.review?.outline?.sections?.[0] ?? null;
      setCurrent(sec);
    });
  }, [reviewId]);

  const startSection = async () => {
    if (!reviewId || !current) return;
    setLoading(true);
    setProgress("开始生成...");
    const res = await fetch(`/api/modules/review/section/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, sectionId: current.id })
    });
    if (!res.ok) {
      try {
        const ct = res.headers.get("content-type") || "";
        if (/application\/json/i.test(ct)) {
          const d = await res.json();
          setProgress(String(d?.detail ?? d?.error ?? "错误：服务不可用或未登录"));
        } else {
          const t = await res.text();
          setProgress(t || "错误：服务不可用或未登录");
        }
      } catch {
        setProgress("错误：服务不可用或未登录");
      }
      setLoading(false);
      return;
    }
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() ?? "";
      for (const part of parts) {
        const lines = part.split('\n');
        const evLine = lines.find(l => l.startsWith('event:'));
        const dataLine = lines.find(l => l.startsWith('data:'));
        const ev = evLine?.slice(6).trim();
        const data = dataLine ? JSON.parse(dataLine.slice(5)) : null;
        if (ev === 'retrieving') setProgress(`检索文献中...`);
        if (ev === 'writing') setProgress(`AI撰写中... ${data?.words ?? 0}字`);
        if (ev === 'complete') {
          setProgress(`完成，本节字数 ${data?.words ?? 0}`);
          // 重新拉取内容
          const d = await fetch(`/api/modules/review/${reviewId}`).then(r => r.json());
          setReview(d.review);
          const secRec = (d.review?.sections ?? []).find((s: any) => s.id === current.id);
          setContent(secRec?.content ?? "");
          setRefs(secRec?.references ?? []);
          setLoading(false);
        }
        if (ev === 'error') { setProgress(`错误：${data?.message}`); setLoading(false); }
      }
    }
  };

  const confirmSection = async () => {
    if (!reviewId || !current) return;
    await fetch(`/api/modules/review/section/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewId, sectionId: current.id }) });
    setProgress('本节已确认');
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-3 space-y-2">
        <h2 className="font-semibold">章节列表</h2>
        <ul className="space-y-1">
          {review?.outline?.sections?.map((s: any) => (
            <li key={s.id} className={`rounded border px-2 py-1 text-sm ${current?.id === s.id ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`} onClick={() => setCurrent(s)}>
              {s.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-9 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{current?.title ?? '选择章节'}</h2>
            <p className="text-sm text-zinc-600">{progress}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={startSection} disabled={loading || !current} className="rounded-md bg-black px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black">生成本章节</button>
            <button onClick={confirmSection} disabled={!content} className="rounded-md border px-3 py-1 text-sm">确认此章节</button>
          </div>
        </div>
        <div className="rounded border p-3">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />
        </div>
        <div className="rounded border p-3">
          <h3 className="font-medium">参考文献</h3>
          <ul className="mt-2 space-y-1">
            {refs.map((r, i) => (
              <li key={i} className="text-sm">[{i+1}] {r.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}