import { searchSemanticScholar, searchGoogleScholar } from "@/lib/literature/search";

type Paper = { title: string; authors: string[]; year?: number; abstract?: string; citationCount?: number; doi?: string; url?: string }

type Framework = {
  id: string
  name: string
  description: string
  coreTheories: string[]
  hypotheses: { id: string; statement: string; rationale: string }[]
  literatureSupport: Paper[]
  innovation: number
  rigor: number
  academic: number
  overall: number
  pros: string[]
  cons: string[]
}

export async function generateFrameworks(topicData: any, userInput: string) {
  const query = String(topicData?.name ?? "") || String(topicData?.title ?? "")
  const now = new Date()
  const fromYear = now.getFullYear() - 2
  const sem = await searchSemanticScholar(query, 20)
  const goo = await searchGoogleScholar(query, 20, { from: fromYear })
  const hot = [...sem.papers, ...goo.papers].slice(0, 20)
  const mkFramework = (idx: number): Framework => {
    const base = (topicData?.name ?? topicData?.title ?? "主题")
    const frameworkPapers = hot.slice(idx * 6, idx * 6 + 6)
    const score = (s: number) => Math.min(10, Math.max(6, s))
    return {
      id: String(idx + 1),
      name: `${base} 理论框架 ${idx + 1}`,
      description: `结合主题与近期热点文献，构建具有可检验假设与理论支撑的框架。用户输入：${userInput}`,
      coreTheories: ["理论A", "理论B", "理论C"].slice(0, 2 + (idx % 2)),
      hypotheses: Array.from({ length: 3 + (idx % 3) }).map((_, i) => ({ id: `H${i + 1}`, statement: `变量X → 变量Y 的正向关系`, rationale: "基于理论A与文献支持" })),
      literatureSupport: frameworkPapers.map((p: any) => ({ title: p.title, authors: p.authors ?? [], year: p.year, abstract: p.abstract, citationCount: p.citationCount, doi: p.doi, url: p.url ?? p.link })),
      innovation: score(6 + idx),
      rigor: score(7 + ((idx * 2) % 3)),
      academic: score(7 + ((idx * 3) % 2)),
      overall: score(7 + idx),
      pros: ["创新性较强", "理论融合充分"],
      cons: ["变量定义需进一步明确"],
    }
  }
  const frameworks = [mkFramework(0), mkFramework(1), mkFramework(2)]
  return { hotResearch: hot, frameworks }
}