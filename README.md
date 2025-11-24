# SSSCI - AI科研工具平台

基于AI的全流程科研辅助平台,帮助研究人员高效完成科研工作。

## 功能特性

- 🎯 **智能主题生成** - AI辅助生成研究主题和方向
- 📊 **研究框架设计** - 自动化构建研究框架
- 📚 **文献综述** - 智能文献搜索和综述生成
- 🔬 **研究设计** - 研究方法论和设计方案生成
- 📝 **论文生成** - AI辅助论文撰写和润色
- 💎 **多级订阅** - FREE/PRO/TEAM 多级订阅方案

## 技术栈

- **前端框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL + Prisma 7
- **认证**: NextAuth.js
- **支付**: Stripe
- **缓存**: Redis (可选)
- **AI集成**: OpenAI API

## 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 14+
- Redis (可选)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd sssci
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env.local` 并填写必需的环境变量:

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/sssci

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Stripe (必需)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...

# OpenAI (可选但推荐)
OPENAI_API_KEY=sk-...

# OAuth Providers (可选)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...

# Redis (可选)
REDIS_URL=redis://localhost:6379
```

4. **初始化数据库**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 可用脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行代码检查
npm test             # 运行测试
npm run prisma:migrate    # 运行数据库迁移
npm run prisma:studio     # 打开Prisma Studio
npm run prisma:generate   # 生成Prisma Client
```

## 部署

### Vercel (推荐)

1. 连接GitHub仓库
2. 配置环境变量
3. 部署

### Docker

```bash
# 构建镜像
docker build -t sssci .

# 运行容器
docker run -p 3000:3000 -e DATABASE_URL=... sssci
```

### Docker Compose

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.prod.yml up
```

## 项目结构

```
sssci/
├── prisma/              # 数据库schema和迁移
├── public/              # 静态资源
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (auth)/    # 认证相关页面
│   │   ├── (dashboard)/ # 仪表盘页面
│   │   └── api/       # API路由
│   ├── components/     # React组件
│   ├── hooks/         # 自定义Hooks
│   ├── lib/           # 核心库
│   │   ├── ai/       # AI相关功能
│   │   ├── auth/     # 认证逻辑
│   │   ├── db/       # 数据库客户端
│   │   ├── middleware/ # 中间件
│   │   └── stripe/   # Stripe集成
│   ├── store/         # 状态管理
│   └── types/         # TypeScript类型定义
└── __tests__/         # 测试文件
```

## 贡献指南

欢迎提交Issue和Pull Request!

## 许可证

MIT

## 联系方式

如有问题,请通过以下方式联系:

- Email: support@sssci.example.com
- Issue Tracker: GitHub Issues
