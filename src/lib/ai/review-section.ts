import { searchSemanticScholar, searchGoogleScholar, summarizePaper, UnifiedPaper } from "@/lib/literature/search";
import { mergeDeduplicate } from "@/lib/literature/deduplication";

type SectionData = { id: string; title: string; keywords: string[]; estimatedReferences: number };

function scorePaper(p: UnifiedPaper, keywords: string[]) {
  const text = `${p.title} ${(p.abstract ?? "")}`.toLowerCase();
  const rel = keywords.reduce((acc, k) => acc + (text.includes(k.toLowerCase()) ? 1 : 0), 0);
  const relScore = Math.min(10, rel * 2.5);
  const citeScore = Math.min(10, (p.citationCount ?? 0) > 200 ? 10 : (p.citationCount ?? 0) / 20);
  const yearScore = Math.min(10, p.year ? Math.max(0, 10 - (new Date().getFullYear() - p.year)) : 5);
  const qualityScore = 7;
  return 0.4 * relScore + 0.3 * citeScore + 0.2 * yearScore + 0.1 * qualityScore;
}

function buildInlineCitations(selected: UnifiedPaper[]) {
  const map = new Map<string, number>();
  selected.forEach((p, i) => map.set(p.title, i + 1));
  const cite = (p: UnifiedPaper) => `[${map.get(p.title)}]`;
  return { cite, references: selected.map((p, i) => ({ index: i + 1, title: p.title, authors: p.authors, year: p.year, url: p.url, doi: p.doi })) };
}

export async function generateSection(section: SectionData, previousContent: string) {
  const query = section.keywords.join(" ") || section.title;
  const sem = await searchSemanticScholar(query, 40);
  const goo = await searchGoogleScholar(query, 40, {});
  const all = mergeDeduplicate(sem.papers, goo.papers);
  const scored = all.map((p) => ({ p, score: scorePaper(p, section.keywords) })).sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, Math.max(10, section.estimatedReferences)).map((s) => s.p);
  const summaries = await Promise.all(selected.map((p) => summarizePaper(p)));
  const { cite, references } = buildInlineCitations(selected);
  let content = `# ${section.title}\n\n`;
  content += previousContent ? `（承接上一节内容）\n\n` : "";
  summaries.forEach((s, i) => {
    const p = selected[i];
    content += `- ${p.title} ${cite(p)}：${s.summary}\n`;
  });
  content += `\n综合来看，本节识别了研究趋势与理论争议，并提出未来研究方向。`;
  const wordCount = content.replace(/[#\-]/g, "").split(/\s+/).filter(Boolean).length;
  const issues: string[] = [];
  if (wordCount < 2800 || wordCount > 3200) issues.push("words_out_of_range");
  const citationCount = (content.match(/\[\d+(?:,\d+|-\d+)?\]/g) ?? []).length;
  if (citationCount < Math.min(10, selected.length)) issues.push("citations_too_few");
  return { content, references, wordCount, citationCount, issues };
}