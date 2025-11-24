import { prisma } from "@/lib/db/client";
import { withTimeout } from "@/lib/ai/retry";
import { logApiCall } from "@/lib/monitoring/logger";

type Input = { projectId: string; keywords: string[]; description: string; field: string; iteration: number };
type Topic = {
  name: string;
  description: string;
  innovation_score: number;
  rigor_score: number;
  academic_score: number;
  pros: string[];
  cons: string[];
  overall_score: number;
};

async function callWithTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return await withTimeout(fn, ms)
}

export async function generateTopics(input: Input): Promise<{ topics: Topic[] }> {
  const start = Date.now();
  try {
    // Placeholder orchestration: In real implementation, chain OpenAI/Anthropic calls and merge.
    const base = (input.keywords.join(" ") + " " + input.field + " " + input.description).slice(0, 100);
    const topics: Topic[] = Array.from({ length: 6 }).map((_, i) => ({
      name: `研究选题 ${i + 1}: ${base.slice(0, 20)}`,
      description: `基于关键词与领域的候选选题，侧重于方法与创新点的综合阐述。迭代 ${input.iteration}。`,
      innovation_score: Math.min(10, 6 + i),
      rigor_score: Math.min(10, 5 + ((i * 3) % 5)),
      academic_score: Math.min(10, 6 + ((i * 2) % 4)),
      pros: ["方法完善", "数据可得", "文献基础充分"],
      cons: ["样本偏差风险", "伦理审查复杂"],
      overall_score: Math.min(10, Math.round((6 + i + 5 + ((i * 3) % 5) + 6 + ((i * 2) % 4)) / 3)),
    }));
    return { topics };
  } catch (e) {
    throw e;
  } finally {
    await logApiCall({ route: "/api/modules/topic/generate", status: 200, durationMs: Date.now() - start, provider: "internal", endpoint: "topic-orchestrator", success: true })
  }
}