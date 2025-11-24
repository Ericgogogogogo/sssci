export class APIError extends Error {
  status: number
  code?: string
  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = "APIError"
    this.status = status
    this.code = code
  }
}

export class RateLimitError extends Error {
  retryAfterMs?: number
  constructor(message = "请求过于频繁，请稍后再试", retryAfterMs?: number) {
    super(message)
    this.name = "RateLimitError"
    this.retryAfterMs = retryAfterMs
  }
}

export class AuthenticationError extends Error {
  constructor(message = "认证失败，请重新登录") {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class ValidationError extends Error {
  field?: string
  constructor(message = "参数校验失败", field?: string) {
    super(message)
    this.name = "ValidationError"
    this.field = field
  }
}

export class TimeoutError extends Error {
  constructor(message = "生成时间较长，请稍候...") {
    super(message)
    this.name = "TimeoutError"
  }
}

type FriendlyMessage = {
  title: string
  description: string
}

export function toFriendlyMessage(err: unknown): FriendlyMessage {
  if (err instanceof RateLimitError) return { title: "API限流", description: err.message }
  if (err instanceof AuthenticationError) return { title: "认证失败", description: err.message }
  if (err instanceof ValidationError) return { title: "参数错误", description: err.message }
  if (err instanceof TimeoutError) return { title: "正在生成", description: err.message }
  const msg = String((err as any)?.message ?? "发生未知错误")
  if (/network/i.test(msg)) return { title: "网络错误", description: "网络连接不稳定，请检查网络后重试" }
  if (/insufficient.*quota|balance/i.test(msg)) return { title: "余额不足", description: "API额度不足，请联系管理员" }
  if (/content.*filter|policy/i.test(msg)) return { title: "内容过滤", description: "生成内容被过滤，请修改输入后重试" }
  return { title: "服务器错误", description: msg }
}

import { prisma } from "@/lib/db/client"

export async function recordError(err: unknown, context?: { userId?: string; projectId?: string; route?: string }) {
  const type = (err as any)?.name ?? "Error"
  const message = String((err as any)?.message ?? "")
  const stack = String((err as any)?.stack ?? "")
  try {
    await prisma.apiCallLog.create({
      data: {
        route: context?.route ?? "unknown",
        status: (err as any)?.status ?? 500,
        durationMs: 0,
        error: `[${type}] ${message}\n${stack}`,
      },
    })
  } catch {}
}