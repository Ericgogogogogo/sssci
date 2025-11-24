type Section = { id: string; title: string; description: string; targetWords: number; keywords: string[]; estimatedReferences: number; order: number }

export function generateOutline(topic: any, framework: any, settings: { totalWords: number; referenceCount: number; structure: string }, userInput: string) {
  const parts = ["研究背景与意义", "理论基础", "国内外研究现状", "研究空白与问题提出", "研究假设"]
  const count = settings.structure === "标准" ? parts.length : 5
  const per = Math.round(settings.totalWords / count)
  const perRefs = Math.max(5, Math.round(settings.referenceCount / count))
  const sections: Section[] = Array.from({ length: count }).map((_, i) => ({
    id: `S${i + 1}`,
    title: parts[i] ?? `部分 ${i + 1}`,
    description: `围绕主题与框架的详述。用户输入：${userInput}`,
    targetWords: per,
    keywords: ["关键词A", "关键词B", "关键词C"],
    estimatedReferences: perRefs,
    order: i + 1,
  }))
  return { sections }
}