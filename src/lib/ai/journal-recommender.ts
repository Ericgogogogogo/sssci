type Journal = { name: string; impactFactor: number; field: string; method: string };
type Recommendation = { name: string; impactFactor: number; acceptanceRate: string; reason: string; suggestions: string };

const journals: Journal[] = [
  { name: "Journal of AI Research", impactFactor: 9.2, field: "AI", method: "QUANTITATIVE" },
  { name: "Information Systems Research", impactFactor: 6.8, field: "IS", method: "QUANTITATIVE" },
  { name: "Computers & Education", impactFactor: 11.1, field: "Education", method: "QUANTITATIVE" },
  { name: "Journal of Experimental Psychology", impactFactor: 5.4, field: "Psychology", method: "EXPERIMENTAL" },
  { name: "IEEE Transactions on Affective Computing", impactFactor: 8.3, field: "AI", method: "QUALITATIVE" },
  { name: "Nature Human Behaviour", impactFactor: 12.7, field: "Psychology", method: "QUANTITATIVE" },
  { name: "Journal of Economic Behavior & Organization", impactFactor: 4.1, field: "Economics", method: "QUANTITATIVE" }
];

export function recommendJournals(paper: { topic?: string; method?: string; field?: string; score?: number }): { primary: Recommendation[]; secondary: Recommendation[] } {
  const f = paper.field ?? "AI";
  const m = paper.method ?? "QUANTITATIVE";
  const s = Math.max(1, Math.min(10, paper.score ?? 6));
  const pool = journals.filter(j => j.field === f || j.method === m).sort((a, b) => b.impactFactor - a.impactFactor).slice(0, 5);
  const toRec = (j: Journal, idx: number): Recommendation => ({
    name: j.name,
    impactFactor: j.impactFactor,
    acceptanceRate: idx < 2 ? "40-60%" : "20-40%",
    reason: `Matches field ${f} and method ${m} with innovation score ${s}.`,
    suggestions: "Strengthen theoretical contribution and clarify methodological rigor."
  });
  const primary = pool.slice(0, 2).map(toRec);
  const secondary = pool.slice(2, 5).map(toRec);
  return { primary, secondary };
}