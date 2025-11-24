export function generateDesign(topic: any, framework: any, methodType: string, userInput: string) {
  const base = {
    goals: ["明确研究目标"],
    samplePlan: { size: 300, sampling: "便利抽样" },
    dataCollection: {},
    analysisMethods: [] as string[],
    timeline: ["T1 设计", "T2 收集", "T3 分析"],
    variables: ["变量X", "变量Y"],
  }
  if (methodType === "QUANTITATIVE") {
    base.dataCollection = { type: "问卷", scale: "李克特7点" }
    base.analysisMethods = ["回归分析", "相关分析", "信效度检验"]
  } else if (methodType === "QUALITATIVE") {
    base.dataCollection = { type: "访谈", coding: "主题编码" }
    base.analysisMethods = ["主题分析", "扎根理论"]
  } else if (methodType === "EXPERIMENTAL") {
    base.dataCollection = { type: "实验", random: true }
    base.analysisMethods = ["方差分析", "操纵检查"]
  } else {
    base.dataCollection = { type: "混合", parts: ["问卷", "访谈"] }
    base.analysisMethods = ["相关与回归", "主题分析"]
  }
  const actionPlan = [
    { step: 1, task: "招募样本" },
    { step: 2, task: "实施数据收集" },
    { step: 3, task: "进行数据分析" },
  ]
  return { designContent: base, actionPlan }
}

export function generateQuestionnaire(design: any, hypotheses: any[]) {
  const demo = [
    { id: "D1", text: "您的年龄", type: "single", options: ["18-24", "25-34", "35-44", "45+"] },
    { id: "D2", text: "您的性别", type: "single", options: ["男", "女", "其他"] },
  ]
  const vars = (design?.variables ?? ["变量X", "变量Y"]).flatMap((v: string, i: number) => Array.from({ length: 3 }).map((_, k) => ({ id: `Q${i + 1}-${k + 1}`, text: `${v} 相关题项`, scale: 7 })))
  const attention = [
    { id: "A1", text: "请选中选项5以确认注意力" },
    { id: "A2", text: "请选中选项3以确认注意力" },
  ]
  return { demographics: demo, variables: vars, attentionChecks: attention, cronbachAlpha: 0.82 }
}

export function generateInterviewGuide(design: any) {
  const topics = (design?.variables ?? ["主题A", "主题B"]).map((v: string) => ({ question: `请谈谈与${v}相关的经历`, followUps: ["可否举例说明", "该经历对您的影响"] }))
  return { guide: topics }
}

export function generateExperimentStimuli(design: any) {
  const stimuli = [{ id: "S1", description: "条件A 刺激物描述" }, { id: "S2", description: "条件B 刺激物描述" }]
  return { stimuli }
}