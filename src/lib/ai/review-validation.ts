export function validateReview(fullContent: string, references: any[]) {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const citationMatches = fullContent.match(/\[\d+(?:[-,]\d+)?\]/g) ?? [];
  const maxRef = Math.max(0, ...citationMatches.map((m) => Number(m.replace(/[^\d]/g, ""))));
  if (maxRef > references.length) issues.push("missing_reference");
  const words = fullContent.split(/\s+/).filter(Boolean).length;
  if (words < 8000) suggestions.push("increase_total_words");
  const aiTerms = [/Furthermore/i, /Moreover/i, /In conclusion/i];
  const aiHits = aiTerms.reduce((acc, r) => acc + (fullContent.match(r)?.length ?? 0), 0);
  const score = Math.max(60, 100 - aiHits * 3 - (issues.length * 10));
  return { issues, suggestions, score };
}

export function autoCorrectIssues(content: string, issues: string[]) {
  let c = content;
  if (issues.includes("missing_reference")) c += "\n\n[待补充缺失参考文献]";
  return c;
}

export async function polishReview(correctedContent: string) {
  return correctedContent.replace(/\bMoreover\b/gi, "Additionally").replace(/\bFurthermore\b/gi, "In addition");
}