export function humanizePaper(draft: string) {
  let s = draft || "";
  s = s.replace(/\bFurthermore\b/gi, "In addition");
  s = s.replace(/\bMoreover\b/gi, "Additionally");
  s = s.replace(/\bAdditionally\b/gi, "Also");
  const parts = s.split(/\n\n/);
  const out = parts.map(p => {
    if (p.length < 200) return p;
    return p.replace(/\./g, ". ").replace(/\s{2,}/g, " ");
  }).join("\n\n");
  return out;
}