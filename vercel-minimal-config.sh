#!/bin/bash

# 最小配置部署脚本 - 用于快速测试

echo "🚀 开始配置最小环境变量..."

# 生成新的随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "✅ 生成的环境变量："
echo "DATABASE_URL=file:./dev.db"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NEXTAUTH_URL=https://sssci.vercel.app"
echo ""

echo "📋 请复制以上变量到 Vercel 控制台："
echo "1. 打开 https://vercel.com/dashboard"
echo "2. 选择你的 sssci 项目"
echo "3. 点击 Settings → Environment Variables"
echo "4. 添加上面的三个变量"
echo "5. 点击 Save"
echo ""

echo "⚠️  重要说明："
echo "- 使用 SQLite 数据库，数据不会持久化"
echo "- 适合测试和演示用途"
echo "- 生产环境建议使用 PostgreSQL"
echo ""

echo "配置完成后，Vercel 会自动重新部署。部署完成后访问："
echo "https://sssci.vercel.app"