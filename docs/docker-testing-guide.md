# Docker 功能测试指南

本文档介绍如何使用Docker进行SSSCI平台的完整功能测试。

## 测试概述

我们提供了两个自动化测试脚本:

1. **`docker-test.sh`** - 完整的端到端测试,包括环境启动、数据库迁移和API测试
2. **`test-api.sh`** - 独立的API端点测试脚本(假设环境已启动)

## 前置要求

- Docker Desktop 已安装并运行
- Docker Compose 已安装
- 端口 3000(应用)、5432(PostgreSQL)、6379(Redis) 未被占用

## 快速开始

### 方式一: 完整自动化测试

这是推荐的方式,会自动完成所有步骤:

```bash
# 1. 赋予执行权限
chmod +x docker-test.sh

# 2. 运行完整测试
./docker-test.sh
```

测试脚本会自动执行以下操作:
1. ✅ 检查Docker环境
2. ✅ 清理现有容器和数据
3. ✅ 构建并启动所有服务(PostgreSQL, Redis, App)
4. ✅ 等待服务就绪
5. ✅ 执行数据库迁移
6. ✅ 运行功能测试
7. ✅ 生成测试报告

### 方式二: 使用现有环境测试

如果Docker环境已经在运行,可以只执行API测试:

```bash
# 1. 确保服务正在运行
docker-compose -f docker-compose.dev.yml ps

# 2. 赋予执行权限
chmod +x test-api.sh

# 3. 运行API测试
./test-api.sh
```

### 方式三: 手动启动环境

如果你想手动控制每一步:

```bash
# 1. 清理现有环境
docker-compose -f docker-compose.dev.yml down -v

# 2. 启动服务
docker-compose -f docker-compose.dev.yml up --build -d

# 3. 等待服务就绪(检查健康状态)
docker-compose -f docker-compose.dev.yml ps

# 4. 执行数据库迁移
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy

# 5. 运行测试
./test-api.sh
```

## 测试报告

### 查看测试结果

测试完成后,会在 `test-results/` 目录下生成以下文件:

- **`test-report.txt`** - 详细的测试报告,包含所有测试结果和统计
- **`response_*.txt`** - 每个API请求的响应内容

查看测试报告:

```bash
cat test-results/test-report.txt
```

### 测试统计

报告会显示:
- 总测试数
- 通过的测试数
- 失败的测试数
- 通过率

## 测试覆盖范围

### 基础设施
- ✅ 健康检查API (`/api/health`)

### 认证功能
- ✅ 用户注册 (`POST /api/auth/register`)
- ✅ 重复邮箱注册验证
- ⚠️ 用户登录 (需要实现NextAuth登录端点)

### 项目管理
- ✅ 项目列表端点可访问性 (`GET /api/projects/list`)
- ✅ 创建项目端点可访问性 (`POST /api/projects/create`)
- ⚠️ 已认证的项目操作 (需要认证token)

### 订阅功能
- ✅ Stripe Checkout会话创建端点 (`POST /api/stripe/create-checkout-session`)
- ✅ 取消订阅端点 (`POST /api/stripe/cancel-subscription`)

### 使用限制
- ✅ 使用限制检查端点 (`GET /api/usage/check`)

### 文献检索
- ✅ 文献搜索端点 (`POST /api/literature/search`)

## 调试和故障排查

### 查看服务状态

```bash
docker-compose -f docker-compose.dev.yml ps
```

### 查看应用日志

```bash
# 实时查看所有服务日志
docker-compose -f docker-compose.dev.yml logs -f

# 只查看应用日志
docker-compose -f docker-compose.dev.yml logs -f app

# 只查看数据库日志
docker-compose -f docker-compose.dev.yml logs -f db
```

### 进入应用容器

```bash
docker-compose -f docker-compose.dev.yml exec app sh
```

进入容器后可以:
```bash
# 检查Prisma状态
npx prisma migrate status

# 重新生成Prisma Client
npm run prisma:generate

# 打开Prisma Studio(需要端口映射)
npm run prisma:studio

# 查看环境变量
env | grep DATABASE_URL
```

### 数据库操作

```bash
# 进入数据库容器
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d sssci

# 查看所有表
\dt

# 查看用户数据
SELECT * FROM "User";

# 退出
\q
```

### 常见问题

#### 问题1: 端口被占用

**症状**: `Error: Port 3000 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 停止占用的进程或更改docker-compose配置
```

#### 问题2: 数据库连接失败

**症状**: `Error: Can't reach database server`

**解决方案**:
```bash
# 检查PostgreSQL容器是否运行
docker-compose -f docker-compose.dev.yml ps db

# 重启数据库服务
docker-compose -f docker-compose.dev.yml restart db

# 查看数据库日志
docker-compose -f docker-compose.dev.yml logs db
```

#### 问题3: Prisma迁移失败

**症状**: `Migration failed`

**解决方案**:
```bash
# 重置数据库(警告:会删除所有数据)
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate reset

# 重新执行迁移
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
```

#### 问题4: 构建失败

**症状**: Docker build errors

**解决方案**:
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建(不使用缓存)
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 测试最佳实践

### 1. 测试前清理环境

始终从干净的状态开始测试:

```bash
docker-compose -f docker-compose.dev.yml down -v
```

### 2. 监控资源使用

```bash
# 查看容器资源使用情况
docker stats
```

### 3. 定期清理未使用的资源

```bash
# 清理未使用的镜像、容器、网络
docker system prune

# 清理所有未使用的数据卷
docker volume prune
```

### 4. 保存测试日志

```bash
# 导出容器日志
docker-compose -f docker-compose.dev.yml logs > docker-logs.txt
```

## 手动测试场景

### 测试用户注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### 测试健康检查

```bash
curl http://localhost:3000/api/health
```

### 使用jq美化JSON输出

```bash
# 安装jq
brew install jq

# 使用jq美化输出
curl -s http://localhost:3000/api/health | jq '.'
```

## 持续集成

这些测试脚本可以集成到CI/CD流程中:

```yaml
# GitHub Actions 示例
name: Docker Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Docker Tests
        run: |
          chmod +x docker-test.sh
          ./docker-test.sh
```

## 下一步

测试通过后:

1. **访问应用**: http://localhost:3000
2. **手动测试UI**: 注册、登录、创建项目等
3. **查看数据库**: 使用Prisma Studio
4. **停止服务**: `docker-compose -f docker-compose.dev.yml down`
5. **部署到生产**: 参考 `docker-compose.prod.yml`

## 贡献

如果发现测试问题或需要添加新的测试用例,请:

1. 在 `test-api.sh` 中添加新的测试函数
2. 更新此文档
3. 提交Pull Request

---

**需要帮助?** 查看项目README或提交Issue。
