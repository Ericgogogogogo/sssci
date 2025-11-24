export function generateAnalysisGuide(design: any, hypotheses: any[], methodType: string) {
  const tool = methodType === "EXPERIMENTAL" ? "SPSS" : "R"
  const guide = {
    dataPreparation: { steps: ["缺失值处理", "异常值检测", "反向题项重编码"] },
    descriptiveStats: { items: ["人口统计分析", "变量均值与标准差", "相关性矩阵"] },
    reliabilityValidity: methodType === "QUANTITATIVE" ? { cronbachAlpha: "SPSS 路径", cfa: "Amos 步骤" } : null,
    hypothesisTesting: (hypotheses ?? []).map((h: any, i: number) => ({ hypothesis: h.id ?? `H${i+1}`, method: "回归分析", spssSteps: ["数据录入", "回归模型"], rCode: "lm(y~x)", interpretationCriteria: { p: 0.05, effectSize: "中等" } })),
    requiredTables: ["样本描述性统计", "信效度检验结果", "相关性分析", "假设检验结果"],
    requiredFigures: ["变量分布图", "散点图", "模型拟合图"],
    toolRecommendation: tool,
  }
  return guide
}