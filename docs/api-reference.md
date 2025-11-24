# API 文档

## 认证
- 使用 NextAuth 会话，部分端点需要登录

## 端点
- POST `/api/modules/topic/generate`：生成选题
- GET `/api/modules/topic/latest?projectId`：查询最新选题记录
- POST `/api/modules/framework/generate`：生成理论框架
- POST `/api/review/create`：创建综述
- POST `/api/review/section/generate`：生成章节
- POST `/api/paper/generate`：生成论文HTML
- GET `/api/health`：健康检查
- GET `/api/admin/monitoring/stats`：监控统计
- GET `/api/admin/monitoring/costs`：成本趋势
- GET `/api/admin/monitoring/users`：用户排行

## 示例
```json
{
  "topics": [ { "name": "示例选题", "overall_score": 8 } ],
  "iteration": 1
}
```

## 错误码
- 401 未登录
- 403 超出使用限制或无权限
- 429 限流
- 5xx 服务器错误

## 速率限制
- 基于内存窗口的限流工具，具体限制随模块而定