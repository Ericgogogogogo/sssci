# Vercel 环境变量表单填写指南

## 🎯 当前表单应该包含：

### 第一个变量：DATABASE_URL

**⚠️ 重要：使用 PostgreSQL 连接字符串，而不是 SQLite 文件路径**

**填写内容：**
- **Name/Key:** `DATABASE_URL`
- **Value:** `postgresql://username:password@host:port/database?sslmode=require`
- **Environments:** 勾选所有三个 ✅ Production ✅ Preview ✅ Development

**如何获取 PostgreSQL 连接字符串：**
1. 登录你的数据库提供商（如 Supabase, Neon, Railway 等）
2. 找到连接信息或直接复制连接字符串
3. 确保格式为：`postgresql://username:password@host:port/database`

**示例连接字符串：**
- Supabase: `postgresql://postgres.username:password@db.xxxxxxxxxx.supabase.co:5432/postgres`
- Neon: `postgresql://username:password@ep-xxxxx-xxxxx.us-east-1.aws.neon.tech:5432/dbname`
- Railway: `postgresql://username:password@containers-us-west-1.railway.app:5432/railway`

**操作步骤：**
1. 在 "Name" 或 "Key" 输入框中输入：`DATABASE_URL`
2. 在 "Value" 输入框中粘贴你的 PostgreSQL 连接字符串
3. 确保所有环境（Production, Preview, Development）都被勾选
4. 点击 "Save" 或 "Add" 按钮

### 第二个变量：NEXTAUTH_SECRET

**填写内容：**
- **Name/Key:** `NEXTAUTH_SECRET`
- **Value:** `0TecaoVjQDI2DM1nOanEsMxbl64wNg1/s+ifHab6BfM=`
- **Environments:** 勾选所有三个 ✅ Production ✅ Preview ✅ Development

**操作步骤：**
1. 再次点击 "Add Environment Variable" 或类似按钮
2. 在 "Name" 或 "Key" 输入框中输入：`NEXTAUTH_SECRET`
3. 在 "Value" 输入框中输入：`0TecaoVjQDI2DM1nOanEsMxbl64wNg1/s+ifHab6BfM=`
4. 确保所有环境都被勾选
5. 点击 "Save" 或 "Add" 按钮

### 第三个变量：NEXTAUTH_URL

**填写内容：**
- **Name/Key:** `NEXTAUTH_URL`
- **Value:** `https://sssci.vercel.app`
- **Environments:** 勾选所有三个 ✅ Production ✅ Preview ✅ Development

**操作步骤：**
1. 再次点击 "Add Environment Variable"
2. 在 "Name" 或 "Key" 输入框中输入：`NEXTAUTH_URL`
3. 在 "Value" 输入框中输入：`https://sssci.vercel.app`
4. 确保所有环境都被勾选
5. 点击 "Save" 或 "Add" 按钮

## ✅ 完成验证

添加完所有三个变量后，你应该看到：
- 变量列表中显示了 DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- 每个变量都显示在 Production, Preview, Development 环境中
- 页面提示部署将自动开始

## 🚀 下一步

完成所有三个变量的添加后，告诉我：
1. 是否成功添加了所有变量？
2. 在变量列表中是否看到了这三个变量？
3. Vercel 是否开始重新部署了？