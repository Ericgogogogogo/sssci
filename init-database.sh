#!/bin/bash

# 数据库初始化脚本 - 用于在Docker环境中初始化Prisma数据库
# Prisma 7的migrate命令在CLI中无法正确读取prisma.config.ts
# 此脚本通过直接连接数据库创建表结构

set -e

COMPOSE_FILE="docker-compose.dev.yml"
DB_CONTAINER="sssci-db-1"

echo "📦 开始数据库初始化..."
echo ""

# 1. 生成CREATE TABLE SQL语句
echo "步骤 1/3: 从Prisma Schema生成SQL..."

# 创建临时prisma schema,将url添加回去以便生成SQL
cat > /tmp/temp_schema.prisma << EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@localhost:5432/temp"
}

$(tail -n +8 /Users/eric/Desktop/sssci/prisma/schema.prisma)
EOF

# 使用prisma migrate diff生成SQL
echo "正在生成表结构SQL..."
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel /tmp/temp_schema.prisma \
  --script > /tmp/init.sql 2>/dev/null || {
    echo "❌ SQL生成失败"
    rm -f /tmp/temp_schema.prisma
    exit 1
}

rm -f /tmp/temp_schema.prisma
echo "✅ SQL生成完成"
echo ""

# 2. 将SQL导入数据库
echo "步骤 2/3: 导入表结构到数据库..."
docker cp /tmp/init.sql $DB_CONTAINER:/tmp/init.sql
docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -d sssci -f /tmp/init.sql
echo "✅ 表结构导入完成"
echo ""

# 3. 验证表创建
echo "步骤 3/3: 验证数据库表..."
TABLES=$(docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -d sssci -t -c "\dt" | grep -c "public" || echo "0")

if [ "$TABLES" -gt 0 ]; then
    echo "✅ 数据库初始化成功! 创建了 $TABLES 个表"
    echo ""
    echo "数据库表列表:"
    docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -d sssci -c "\dt"
else
    echo "❌ 数据库初始化失败,未找到表"
    exit 1
fi

# 清理临时文件
rm -f /tmp/init.sql

echo ""
echo "🎉 数据库初始化完成!"
