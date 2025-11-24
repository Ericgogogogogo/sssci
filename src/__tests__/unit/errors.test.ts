import { APIError, RateLimitError, AuthenticationError, ValidationError, TimeoutError, toFriendlyMessage } from "@/lib/errors/handler"

test("friendly messages mapping", () => {
  expect(toFriendlyMessage(new RateLimitError()).title).toBe("API限流")
  expect(toFriendlyMessage(new AuthenticationError()).title).toBe("认证失败")
  expect(toFriendlyMessage(new ValidationError()).title).toBe("参数错误")
  expect(toFriendlyMessage(new TimeoutError()).title).toBe("正在生成")
  expect(toFriendlyMessage(new APIError("网络错误", 500)).title).toBe("服务器错误")
})