# SSSCI 部署指南

## Vercel 部署步骤

### 1. 准备环境变量

在 Vercel 控制台中配置以下环境变量：

#### 必需环境变量
- `DATABASE_URL` - PostgreSQL 数据库连接字符串
- `NEXTAUTH_SECRET` - NextAuth 密钥 (至少32位随机字符串)
- `NEXTAUTH_URL` - 应用URL (部署后自动生成)
- `STRIPE_SECRET_KEY` - Stripe 密钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥

#### 可选环境变量
- `OPENAI_API_KEY` - OpenAI API 密钥
- `REDIS_URL` - Redis 连接字符串
- `GOOGLE_CLIENT_ID` - Google OAuth 客户端ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 客户端密钥
- `GITHUB_ID` - GitHub OAuth 应用ID
- `GITHUB_SECRET` - GitHub OAuth 应用密钥
- `STRIPE_PRICE_PRO` - Stripe Pro 价格ID
- `STRIPE_PRICE_TEAM` - Stripe Team 价格ID

### 2. 数据库设置

1. 准备 PostgreSQL 数据库 (版本 14+)
2. 运行数据库迁移：
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### 3. 部署命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

### 4. 部署后配置

1. 在 Vercel 控制台设置自定义域名
2. 配置 Stripe Webhook 端点: `https://your-domain.com/api/stripe/webhook`
3. 设置数据库连接
4. 测试应用功能

### 5. 监控和维护

- 查看 Vercel 函数日志
- 监控数据库性能
- 检查 API 调用日志
- 定期备份数据库

## 注意事项

- 确保所有必需的环境变量都已正确配置
- PostgreSQL 数据库需要支持 SSL 连接
- Stripe Webhook 需要正确的签名验证
- 建议启用 Redis 以获得更好的性能