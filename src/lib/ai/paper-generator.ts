type Figure = { type: "PNG" | "PDF"; name: string; dataUrl?: string };
type ResultsInput = { figures?: Figure[]; tables?: { name: string; headers: string[]; rows: string[][] }[] };

type FullPaper = { title: string; abstract: string; keywords: string[]; markdown: string; references: string[] };

function extractKeywords(text: string, count: number) {
  const words = (text || "").toLowerCase().replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, " ").split(/\s+/).filter(Boolean);
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, count).map(([w]) => w).filter(w => w.length > 2);
}

function buildSection(title: string, content: string) {
  return `\n\n## ${title}\n\n${content}`;
}

function insertFiguresAndTables(results?: ResultsInput) {
  let markers = "";
  if (results?.tables && results.tables.length) markers += `\n\n[TABLE-1]`;
  if (results?.figures && results.figures.length) markers += `\n\n[FIGURE-1]`;
  return markers;
}

export function generateFullPaper(review: any, design: any, results: ResultsInput): FullPaper {
  const reviewText = typeof review === "string" ? review : JSON.stringify(review);
  const designText = typeof design === "string" ? design : JSON.stringify(design);
  const title = "Integrated Study on Topic";
  const abstract = `This paper integrates literature review and research design to present a comprehensive study. It summarizes background, hypotheses, methodology, and key findings with academic rigor.`;
  const keywords = extractKeywords(reviewText + " " + designText, 6);
  const intro = `The study builds on prior literature and addresses gaps by formulating testable hypotheses based on the synthesized theoretical framework.`;
  const framework = `The theoretical framework connects core constructs and posits relationships that are examined empirically.`;
  const methodology = `The methodology describes the research design, sampling, instruments, and analytical procedures.`;
  const res = `Results report descriptive statistics and hypothesis tests with clear structure.` + insertFiguresAndTables(results);
  const discussion = `Findings are interpreted in light of existing literature, highlighting contributions and practical implications.`;
  const conclusion = `The paper concludes with a concise summary and directions for future research.`;
  const limitations = `Limitations include sampling constraints and measurement bias; future work may broaden contexts and refine instruments.`;
  const refs = Array.isArray(review?.references) ? review.references : [];
  const refsList = refs.map((r: any) => typeof r === "string" ? r : JSON.stringify(r));
  const md = `# ${title}\n\n### Abstract\n\n${abstract}\n\n**Keywords:** ${keywords.join(", ")}`
    + buildSection("Introduction", intro)
    + buildSection("Theoretical Framework", framework)
    + buildSection("Methodology", methodology)
    + buildSection("Results", res)
    + buildSection("Discussion", discussion)
    + buildSection("Conclusion", conclusion)
    + buildSection("Limitations & Future Research", limitations)
    + buildSection("References", (refsList.length ? refsList.join("\n") : ""));
  return { title, abstract, keywords, markdown: md, references: refsList };
}