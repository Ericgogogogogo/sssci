# 开发者文档

## 项目架构
- Next.js 应用，Prisma ORM（PostgreSQL）、Redis 缓存
- 业务模块：选题、框架、综述、设计、论文

## 技术栈
- Next.js 16、React 19、Prisma、Redis、Stripe、Chart.js
- 测试：Jest + RTL
- 日志：Winston

## 本地开发
- 安装依赖：`npm ci`
- 运行开发：`npm run dev`
- 环境变量：使用 `.env.development`
- 数据库：`docker-compose -f docker-compose.dev.yml up`

## 代码规范
- 使用 TypeScript
- 模块化、函数命名清晰
- 禁止提交敏感信息

## 贡献指南
- 提交 PR 前确保测试通过与覆盖率达标
- 通过 GitHub Actions 自动测试与部署