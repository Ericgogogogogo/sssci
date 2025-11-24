# Vercel 环境变量配置详细指南

## 🔍 页面内容分析

你看到的页面包含这些关键区域：

```
Environment Variables
In order to provide your Deployment with Environment Variables at Build and Runtime, you may enter them right here, for the Environment of your choice. Learn more

A new Deployment is required for your changes to take effect.

[Create new] [Link Shared Environment Variables]

Sensitive - If enabled, you and your team will not be able to read the values after creation. Learn more

Environments: Production | Preview | Development

Key | Value
[输入框区域] or paste the .env contents above

Automatically expose System Environment Variables
Sort by… Last Updated | Name | Type

No Environment Variables Added
Add Environment Variables to Production, Preview, and Development environments, including branches in Preview.

Shared Environment Variables
No Shared Environment Variables are linked to this app.
```

## 🎯 正确的操作步骤

### 方法1：使用输入框区域

1. **找到 "Key" 和 "Value" 输入框**
   - 在页面中部应该有两个输入框
   - 一个标记为 "Key"，另一个标记为 "Value"

2. **添加第一个变量：**
   - Key输入框：`DATABASE_URL`
   - Value输入框：`file:./dev.db`
   - 按Enter或点击添加按钮

3. **添加第二个变量：**
   - Key输入框：`NEXTAUTH_SECRET`
   - Value输入框：`0TecaoVjQDI2DM1nOanEsMxbl64wNg1/s+ifHab6BfM=`
   - 按Enter或点击添加按钮

4. **添加第三个变量：**
   - Key输入框：`NEXTAUTH_URL`
   - Value输入框：`https://sssci.vercel.app`
   - 按Enter或点击添加按钮

### 方法2：使用粘贴功能

1. **在输入框区域上方找到 "or paste the .env contents above"**
2. **复制以下内容：**
   ```
   DATABASE_URL=file:./dev.db
   NEXTAUTH_SECRET=0TecaoVjQDI2DM1nOanEsMxbl64wNg1/s+ifHab6BfM=
   NEXTAUTH_URL=https://sssci.vercel.app
   ```
3. **粘贴到输入区域**
4. **系统应该会自动解析并添加所有变量**

## ✅ 验证步骤

添加完成后，你应该看到：
- 三个环境变量出现在列表中
- 每个变量显示在 Production, Preview, Development 环境中
- 页面提示 "A new Deployment is required"

## 🚀 下一步

完成添加后，Vercel会自动开始重新部署。请告诉我：
1. 你看到了哪些输入选项？
2. 你尝试了哪种方法？
3. 是否成功添加了变量？