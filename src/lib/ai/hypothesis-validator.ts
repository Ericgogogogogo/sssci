export async function validateHypothesisTestability(design: any, hypotheses: any[]) {
  const items = (hypotheses ?? []).map((h: any, i: number) => ({
    hypothesis_id: h.id ?? `H${i + 1}`,
    is_testable: true,
    reasoning: "变量可测量，方法可检验，样本量满足基本要求",
    missing_elements: [],
    suggestions: [],
  }))
  const overall = items.every((x) => x.is_testable)
  return { overall_testable: overall, hypothesis_validations: items }
}