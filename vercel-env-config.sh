#!/bin/bash

# Vercel 环境变量配置脚本
# 复制这些变量到 Vercel 控制台的项目设置中

echo "🔑 必需环境变量:"
echo "DATABASE_URL=postgresql://username:password@host:port/database"
echo "NEXTAUTH_SECRET=XhVieYcDWkndDZmCnhmvlx+MLMERNHUjrDa1L5KzV5c="
echo "NEXTAUTH_URL=https://sssci.vercel.app"
echo ""

echo "💳 支付配置 (可选):"
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""

echo "🤖 AI API 密钥 (可选):"
echo "OPENAI_API_KEY=sk-..."
echo "SERPAPI_API_KEY=..."
echo "SEMANTIC_SCHOLAR_API_KEY=..."
echo ""

echo "🔄 Redis 缓存 (可选):"
echo "REDIS_URL=redis://default:password@host:port"
echo ""

echo "🔐 OAuth 配置 (可选):"
echo "GOOGLE_CLIENT_ID=..."
echo "GOOGLE_CLIENT_SECRET=..."
echo "GITHUB_ID=..."
echo "GITHUB_SECRET=..."
echo ""

echo "📧 邮件配置 (可选):"
echo "RESEND_API_KEY=re_..."
echo ""

echo "✅ 配置完成!"
echo "请将这些变量复制到 Vercel 控制台的项目设置页面"