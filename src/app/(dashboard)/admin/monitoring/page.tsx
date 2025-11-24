"use client"
import { useEffect, useState } from "react"
import { TrendChart } from "@/components/admin/TrendChart"
import { RoleChart, PlanChart } from "@/components/admin/Charts"

type Stats = { totalCalls: number; totalCost: number; avgLatencyMs: number; successRate: number }

export default function MonitoringPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<any[]>([])
  const [apiDist, setApiDist] = useState<Record<string, number>>({})
  const [modelUsage, setModelUsage] = useState<Record<string, number>>({})
  const [users, setUsers] = useState<{ topByCost: any[]; topByCalls: any[] } | null>(null)
  const [providers, setProviders] = useState<any[]>([])

  const [form, setForm] = useState({
    name: "",
    baseUrl: "",
    defaultModel: "",
    enabled: true,
    rateLimitPerMin: "",
    timeoutMs: "",
    maxRetries: "",
  })

  useEffect(() => {
    const load = async () => {
      const s = await fetch("/api/admin/monitoring/stats").then((r) => r.json())
      const c = await fetch("/api/admin/monitoring/costs").then((r) => r.json())
      const u = await fetch("/api/admin/monitoring/users").then((r) => r.json())
      const p = await fetch("/api/admin/config/providers").then((r) => r.json()).catch(() => ({ providers: [] }))
      setStats(s)
      setDaily(c.daily)
      setApiDist(c.apiDist)
      setModelUsage(c.modelUsage)
      setUsers(u)
      setProviders(p.providers ?? [])
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">用量监控与成本控制</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="今日调用" value={stats.totalCalls} />
          <Card title="今日成本($)" value={stats.totalCost.toFixed?.(4) ?? stats.totalCost} />
          <Card title="平均延迟(ms)" value={stats.avgLatencyMs} />
          <Card title="成功率" value={`${(stats.successRate * 100).toFixed(1)}%`} />
        </div>
      )}

      {stats && (stats as any).alerts?.length > 0 && (
        <div className="mt-4 p-4 rounded border border-yellow-500/40">
          <div className="text-sm font-medium text-yellow-500">成本告警</div>
          <ul className="text-sm mt-2">
            {(stats as any).alerts.map((a: string) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium mb-2">每日成本趋势</h2>
        <div className="bg-white/5 rounded p-4">
          <TrendChart labels={daily.map((d) => d.date)} values={daily.map((d) => Number(d.cost ?? 0))} title="每日成本($)" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-medium mb-2">API分布</h2>
          <div className="bg-white/5 rounded p-4">
            <PlanChart data={apiDist} />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">模型使用占比</h2>
          <div className="bg-white/5 rounded p-4">
            <RoleChart data={modelUsage} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">API配置管理</h2>
        <div className="bg-white/5 rounded p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="px-2 py-1 rounded bg-black/20" placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="px-2 py-1 rounded bg-black/20" placeholder="Base URL" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
            <input className="px-2 py-1 rounded bg-black/20" placeholder="默认模型" value={form.defaultModel} onChange={(e) => setForm({ ...form, defaultModel: e.target.value })} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
              <span className="text-sm">启用</span>
            </div>
            <input className="px-2 py-1 rounded bg-black/20" placeholder="每分钟限速" value={form.rateLimitPerMin} onChange={(e) => setForm({ ...form, rateLimitPerMin: e.target.value })} />
            <input className="px-2 py-1 rounded bg-black/20" placeholder="超时(ms)" value={form.timeoutMs} onChange={(e) => setForm({ ...form, timeoutMs: e.target.value })} />
            <input className="px-2 py-1 rounded bg-black/20" placeholder="重试次数" value={form.maxRetries} onChange={(e) => setForm({ ...form, maxRetries: e.target.value })} />
          </div>
          <div>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              onClick={async () => {
                const res = await fetch("/api/admin/config/providers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.name,
                    baseUrl: form.baseUrl || undefined,
                    defaultModel: form.defaultModel || undefined,
                    enabled: form.enabled,
                    rateLimitPerMin: form.rateLimitPerMin ? Number(form.rateLimitPerMin) : undefined,
                    timeoutMs: form.timeoutMs ? Number(form.timeoutMs) : undefined,
                    maxRetries: form.maxRetries ? Number(form.maxRetries) : undefined,
                  }),
                })
                const data = await res.json().catch(() => ({}))
                if (res.ok) {
                  setProviders((prev) => [data.provider, ...prev])
                  setForm({ name: "", baseUrl: "", defaultModel: "", enabled: true, rateLimitPerMin: "", timeoutMs: "", maxRetries: "" })
                } else alert(data?.error ?? "创建失败")
              }}
            >添加配置</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-2 py-1">名称</th>
                  <th className="px-2 py-1">Base URL</th>
                  <th className="px-2 py-1">默认模型</th>
                  <th className="px-2 py-1">启用</th>
                  <th className="px-2 py-1">限速</th>
                  <th className="px-2 py-1">超时</th>
                  <th className="px-2 py-1">重试</th>
                  <th className="px-2 py-1">操作</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} className="border-b border-white/10">
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.baseUrl ?? "-"}</td>
                    <td className="px-2 py-1">{p.defaultModel ?? "-"}</td>
                    <td className="px-2 py-1">
                      <input type="checkbox" checked={Boolean(p.enabled)} onChange={async (e) => {
                        const res = await fetch(`/api/admin/config/providers/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: e.target.checked }) })
                        const data = await res.json().catch(() => ({}))
                        if (res.ok) setProviders((prev) => prev.map((x) => (x.id === p.id ? data.provider : x)))
                        else alert(data?.error ?? "更新失败")
                      }} />
                    </td>
                    <td className="px-2 py-1">{p.rateLimitPerMin ?? "-"}</td>
                    <td className="px-2 py-1">{p.timeoutMs ?? "-"}</td>
                    <td className="px-2 py-1">{p.maxRetries ?? "-"}</td>
                    <td className="px-2 py-1 flex gap-2">
                      <button className="px-2 py-1 rounded bg-zinc-700" onClick={async () => {
                        const name = prompt("新名称", p.name) ?? p.name
                        const res = await fetch(`/api/admin/config/providers/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
                        const data = await res.json().catch(() => ({}))
                        if (res.ok) setProviders((prev) => prev.map((x) => (x.id === p.id ? data.provider : x)))
                        else alert(data?.error ?? "更新失败")
                      }}>重命名</button>
                      <button className="px-2 py-1 rounded bg-red-600" onClick={async () => {
                        if (!confirm("确认删除该配置？")) return
                        const res = await fetch(`/api/admin/config/providers/${p.id}`, { method: "DELETE" })
                        const data = await res.json().catch(() => ({}))
                        if (res.ok) setProviders((prev) => prev.filter((x) => x.id !== p.id))
                        else alert(data?.error ?? "删除失败")
                      }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {users && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Top 10消费用户</h2>
            <ul className="text-sm bg-white/5 rounded p-4">
              {users.topByCost.map((u) => (
                <li key={u.userId}>{u.userId}: ${u.cost}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2">Top 10调用次数用户</h2>
            <ul className="text-sm bg-white/5 rounded p-4">
              {users.topByCalls.map((u) => (
                <li key={u.userId}>{u.userId}: {u.calls} 次</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded border border-white/10 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
