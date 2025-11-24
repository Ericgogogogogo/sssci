#!/bin/bash

# SSSCI Docker本地部署快速启动脚本
# 用途: 一键检查环境并启动所有服务

set -e  # 遇到错误立即退出

echo "🚀 SSSCI Docker 本地部署启动脚本"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查Docker环境
echo "📦 步骤 1/6: 检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装,请先安装Docker Desktop${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker版本: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose版本: $(docker-compose --version)${NC}"
echo ""

# 2. 检查环境变量文件
echo "🔧 步骤 2/6: 检查环境变量配置..."
if [ ! -f .env.development ]; then
    echo -e "${YELLOW}⚠️  .env.development 不存在,从示例创建...${NC}"
    cp .env.example .env.development
    echo -e "${YELLOW}⚠️  请编辑 .env.development 配置必需的环境变量:${NC}"
    echo "   - NEXTAUTH_SECRET (运行: openssl rand -base64 32)"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo ""
    echo -e "${RED}❌ 请配置环境变量后重新运行此脚本${NC}"
    exit 1
fi

# 检查关键环境变量
source .env.development
if [ "$NEXTAUTH_SECRET" == "changeme" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET 未配置或使用默认值${NC}"
    echo -e "${YELLOW}   建议运行: openssl rand -base64 32${NC}"
fi

echo -e "${GREEN}✅ 环境变量文件存在${NC}"
echo ""

# 3. 停止现有容器(如果有)
echo "🛑 步骤 3/6: 停止现有容器..."
docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 4. 构建并启动服务
echo "🏗️  步骤 4/6: 构建并启动服务(这可能需要几分钟)..."
echo ""
docker-compose -f docker-compose.dev.yml up --build -d

# 5. 等待服务健康
echo ""
echo "⏳ 步骤 5/6: 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 服务状态:"
docker-compose -f docker-compose.dev.yml ps
echo ""

# 6. 数据库迁移提示
echo "🗄️  步骤 6/6: 数据库迁移"
echo ""
echo -e "${YELLOW}⚠️  需要手动执行数据库迁移:${NC}"
echo ""
echo "   1. 进入容器:"
echo -e "      ${GREEN}docker-compose -f docker-compose.dev.yml exec app sh${NC}"
echo ""
echo "   2. 执行迁移:"
echo -e "      ${GREEN}npm run prisma:generate${NC}"
echo -e "      ${GREEN}npx prisma migrate deploy${NC}"
echo ""
echo "   3. 退出容器:"
echo -e "      ${GREEN}exit${NC}"
echo ""

# 完成提示
echo "=================================="
echo -e "${GREEN}✅ Docker服务已启动!${NC}"
echo ""
echo "📍 访问地址:"
echo "   - 前端: http://localhost:3000"
echo "   - 健康检查: http://localhost:3000/api/health"
echo "   - Prisma Studio: npm run prisma:studio (在容器内)"
echo ""
echo "📝 查看日志:"
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 停止服务:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
