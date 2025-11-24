"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function DesignPage() {
  const p = useParams<{ id: string }>();
  const id = (p?.id ?? "") as string;
  const [method, setMethod] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [designId, setDesignId] = useState<string | null>(null);
  const [design, setDesign] = useState<any>(null);
  const [validations, setValidations] = useState<any>(null);
  const [materials, setMaterials] = useState<any>(null);

  const generate = async () => {
    if (!method) return;
    setLoading("AI生成初步设计...");
    setError("");
    const r1 = await fetch("/api/modules/design/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id, methodType: method, userDescription: desc, iteration: 1 }) });
    const d1 = await r1.json();
    if (!r1.ok) { setLoading(""); setError(String(d1?.detail ?? d1?.error ?? "生成失败")); return; }
    setDesignId(d1.designId);
    setDesign(d1);
    setLoading("验证假设可检验性...");
    const r2 = await fetch("/api/modules/design/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ designId: d1.designId }) });
    const d2 = await r2.json();
    if (!r2.ok) { setLoading(""); setError(String(d2?.detail ?? d2?.error ?? "验证失败")); return; }
    setValidations(d2.validations);
    setLoading("生成实施材料...");
    const r3 = await fetch("/api/modules/design/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ designId: d1.designId }) });
    const d3 = await r3.json();
    if (!r3.ok) { setLoading(""); setError(String(d3?.detail ?? d3?.error ?? "生成材料失败")); return; }
    setMaterials(d3.materials);
    setLoading("");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">研究设计助手</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { key: "QUANTITATIVE", name: "定量", desc: "变量测量与统计分析" },
          { key: "QUALITATIVE", name: "定性", desc: "访谈与主题分析" },
          { key: "EXPERIMENTAL", name: "实验", desc: "操纵与随机分配" },
          { key: "MIXED", name: "混合", desc: "整合定量与定性" },
        ].map((m) => (
          <div key={m.key} className={`rounded border p-4 ${method===m.key?'ring-2 ring-blue-600':''}`}>
            <div className="font-semibold">{m.name}</div>
            <p className="text-sm text-zinc-600">{m.desc}</p>
            <button onClick={() => setMethod(m.key)} className="mt-2 rounded border px-2 py-1 text-sm">选择</button>
          </div>
        ))}
      </div>
      {method && (
        <div className="rounded border p-4 space-y-2">
          <div className="text-sm text-zinc-600">用户描述</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={6} className="w-full rounded border px-3 py-2 text-sm" placeholder="补充对设计的要求" />
          <div className="flex justify-end">
            <button onClick={generate} className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">生成研究设计</button>
          </div>
          {loading && <div className="text-sm text-zinc-600">{loading}</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      )}
      {design && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button className="rounded border px-2 py-1 text-sm">研究设计概览</button>
            <button className="rounded border px-2 py-1 text-sm">假设验证结果</button>
            <button className="rounded border px-2 py-1 text-sm">实施材料</button>
            <button className="rounded border px-2 py-1 text-sm">行动计划</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <div className="text-sm">研究目标</div>
              <ul className="mt-2 text-sm">
                {(design.designContent?.goals ?? []).map((g: any, i: number) => <li key={i}>{g}</li>)}
              </ul>
              <div className="mt-2 text-sm">样本计划</div>
              <div className="text-sm">{design.designContent?.samplePlan?.size} 人</div>
              <div className="mt-2 text-sm">数据收集方法</div>
              <div className="text-sm">{design.designContent?.dataCollection?.type}</div>
              <div className="mt-2 text-sm">数据分析方法</div>
              <ul className="mt-2 text-sm">
                {(design.designContent?.analysisMethods ?? []).map((g: any, i: number) => <li key={i}>{g}</li>)}
              </ul>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm">假设验证</div>
              <ul className="mt-2 space-y-2">
                {(validations?.hypothesis_validations ?? []).map((h: any, i: number) => (
                  <li key={i} className={`rounded border p-2 text-sm ${h.is_testable?'border-green-600':'border-red-600'}`}>
                    <div>{h.hypothesis_id} {h.is_testable? '可验证' : '不可验证'}</div>
                    <div className="text-zinc-600">{h.reasoning}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm">实施材料</div>
              <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(materials, null, 2)}</pre>
              <div className="mt-2"><button className="rounded border px-2 py-1 text-sm">下载材料</button></div>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm">行动计划</div>
              <ul className="mt-2 text-sm">
                {(design.actionPlan ?? []).map((a: any, i: number) => <li key={i}>{a.step}. {a.task}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}