import { calculateCost } from "@/lib/monitoring/cost-calculator"

test("cost calculator", () => {
  expect(calculateCost("openai", "gpt-3.5-turbo", { input: 1000, output: 2000 })).toBeCloseTo(0.0005 + 0.003)
  expect(calculateCost("serpapi", undefined, {})).toBeCloseTo(0.001)
})