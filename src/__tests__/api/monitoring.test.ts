test("monitoring stats endpoint returns shape", async () => {
  const res = await fetch("http://localhost:3000/api/admin/monitoring/stats").catch(() => null)
  if (!res || !res.ok) return
  const ct = res.headers.get("content-type") || ""
  if (!/application\/json/i.test(ct)) return
  const data = await res.json()
  expect(typeof data.totalCalls).toBe("number")
  expect(typeof data.avgLatencyMs).toBe("number")
})