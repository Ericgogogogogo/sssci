import { z } from "zod";

/**
 * 环境变量验证Schema
 * 确保所有必需的环境变量在应用启动时都已配置
 */
const envSchema = z.object({
    // 数据库
    DATABASE_URL: z.string().min(1, "DATABASE_URL 是必需的"),

    // NextAuth
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET 是必需的"),

    // OAuth Providers (可选)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),

    // Stripe (必需用于支付功能)
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY 是必需的"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET 是必需的"),
    STRIPE_PRICE_PRO: z.string().optional(),
    STRIPE_PRICE_TEAM: z.string().optional(),

    // 第三方API (可选)
    OPENAI_API_KEY: z.string().optional(),
    SEMANTIC_SCHOLAR_API_KEY: z.string().optional(),
    SERPAPI_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),

    // Redis (可选)
    REDIS_URL: z.string().optional(),

    // 其他
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
    ADMIN_ALERT_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 验证环境变量
 * @throws {Error} 如果必需的环境变量缺失或无效
 */
export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues
                .map((err: z.ZodIssue) => `  - ${err.path.join(".")}: ${err.message}`)
                .join("\n");

            throw new Error(
                `❌ 环境变量配置错误:\n\n${missingVars}\n\n` +
                `请检查 .env 文件并确保所有必需的环境变量都已配置。\n` +
                `参考 .env.example 文件查看所需的环境变量。`
            );
        }
        throw error;
    }
}

/**
 * 获取已验证的环境变量
 * 在应用启动时调用一次,缓存结果
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
    if (!cachedEnv) {
        cachedEnv = validateEnv();
    }
    return cachedEnv;
}

// 仅在非测试环境中自动验证
if (process.env.NODE_ENV !== "test") {
    try {
        validateEnv();
        console.log("✅ 环境变量验证通过");
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
