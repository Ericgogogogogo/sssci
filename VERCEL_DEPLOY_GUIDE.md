# Vercel 环境变量配置指南

## 🔑 必需环境变量

### 数据库配置
```
DATABASE_URL=postgresql://username:password@host:port/database
```
- 使用 PostgreSQL 14+ 
- 推荐服务: Supabase, Neon, PlanetScale

### 认证配置
```
NEXTAUTH_SECRET=your-32-character-random-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```
- `NEXTAUTH_SECRET`: 至少32位随机字符串
- `NEXTAUTH_URL`: 您的应用URL (Vercel会自动生成)

### 支付配置
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- 从 Stripe 控制台获取
- Webhook 端点: `https://your-app.vercel.app/api/stripe/webhook`

## ⚙️ 可选环境变量

### AI API 密钥
```
OPENAI_API_KEY=sk-...
SERPAPI_API_KEY=...
SEMANTIC_SCHOLAR_API_KEY=...
```

### Redis 缓存
```
REDIS_URL=redis://default:password@host:port
```
- 推荐服务: Upstash Redis (与Vercel集成良好)

### OAuth 配置
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

### 价格配置
```
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
```

## 🚀 部署步骤

### 1. 数据库设置
```bash
# 连接数据库后运行
npx prisma migrate deploy
npx prisma generate
```

### 2. Vercel 控制台配置
1. 登录 https://vercel.com
2. 创建新项目
3. 导入 GitHub 仓库
4. 在 "Environment Variables" 部分添加上述变量
5. 部署项目

### 3. 部署后配置
- 设置自定义域名 (可选)
- 配置 Stripe Webhook
- 测试所有API功能

## 📊 新功能验证清单

部署后请验证以下新功能：

### 可视化API配置管理
- [ ] 访问 `/admin/monitoring` 页面
- [ ] 测试添加新的API配置
- [ ] 验证配置实时生效
- [ ] 测试启用/禁用API功能

### 数据监控看板
- [ ] 查看API调用统计图表
- [ ] 验证成本监控功能
- [ ] 测试速率限制效果
- [ ] 检查错误日志记录

### 核心API集成
- [ ] 测试 Semantic Scholar 搜索
- [ ] 验证 SerpAPI 集成
- [ ] 测试 OpenAI 摘要功能
- [ ] 验证邮件通知功能

## 🔧 故障排除

### 常见问题
1. **数据库连接失败**: 检查 DATABASE_URL 格式
2. **认证错误**: 确认 NEXTAUTH_SECRET 长度
3. **API调用失败**: 检查相应API密钥
4. **Redis连接失败**: 确认 REDIS_URL 格式

### 性能优化
- 启用 Redis 缓存提高性能
- 配置适当的API速率限制
- 监控API使用成本

## 📞 支持

如有问题，请检查：
- Vercel 函数日志
- 数据库连接状态
- API提供商状态页面
- 项目 GitHub Issues