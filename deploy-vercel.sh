#!/bin/bash

# SSSCI Vercel 部署脚本

echo "🚀 开始部署 SSSCI 到 Vercel..."

# 检查是否已安装Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，请检查错误"
    exit 1
fi

# 拉取环境变量模板
echo "📝 准备环境变量..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "⚠️  请编辑 .env.local 文件添加您的环境变量"
fi

# 部署到Vercel
echo "🌐 开始部署到 Vercel..."
echo "请确保您已经："
echo "1. 在 Vercel 控制台创建了项目"
echo "2. 配置了所有必需的环境变量"
echo "3. 设置了数据库连接"
echo ""
echo "部署命令: vercel --prod"
echo ""
echo "📋 部署后配置检查清单："
echo "□ 配置 Stripe Webhook: https://your-domain.com/api/stripe/webhook"
echo "□ 设置数据库迁移: npx prisma migrate deploy"
echo "□ 测试API配置管理功能"
echo "□ 验证管理监控面板"
echo "□ 检查所有API集成"

echo ""
echo "🎯 项目特性已准备就绪："
echo "✅ 可视化API配置管理界面"
echo "✅ 动态配置存储系统"
echo "✅ 实时监控数据看板"
echo "✅ 集成所有API提供商(OpenAI, SerpAPI, 等)"
echo "✅ 速率限制和错误处理"
echo "✅ 成本监控和日志记录"

echo ""
echo "🔗 现在可以运行: vercel --prod"