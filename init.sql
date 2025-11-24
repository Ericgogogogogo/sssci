-- SSSCI数据库初始化SQL脚本
-- 基于prisma/schema.prisma生成

-- 创建枚举类型
CREATE TYPE "Role" AS ENUM ('FREE', 'PRO', 'TEAM', 'ADMIN');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');
CREATE TYPE "ProjectStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- 创建User表
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 创建Subscription表
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" "Role" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- 创建UsageLimit表
CREATE TABLE "UsageLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
    "frameworkGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
    "reviewSectionsUsed" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageLimit_pkey" PRIMARY KEY ("id")
);

-- 创建Project表
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "field" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentModule" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- 创建TopicGeneration表
CREATE TABLE "TopicGeneration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "iteration" INTEGER NOT NULL,
    "userInput" JSONB NOT NULL,
    "generatedTopics" JSONB NOT NULL,
    "selectedTopicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicGeneration_pkey" PRIMARY KEY ("id")
);

-- 创建ApiCallLog表
CREATE TABLE "ApiCallLog" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiProvider" TEXT,
    "endpoint" TEXT,
    "model" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" DOUBLE PRECISION,
    "latencyMs" INTEGER,
    "success" BOOLEAN DEFAULT true,
    "userId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "ApiCallLog_pkey" PRIMARY KEY ("id")
);

-- 创建FrameworkGeneration表
CREATE TABLE "FrameworkGeneration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "iteration" INTEGER NOT NULL,
    "selectedTopic" JSONB NOT NULL,
    "userDescription" TEXT NOT NULL,
    "hotResearch" JSONB NOT NULL,
    "generatedFrameworks" JSONB NOT NULL,
    "selectedFrameworkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkGeneration_pkey" PRIMARY KEY ("id")
);

-- 创建LiteratureReview表
CREATE TABLE "LiteratureReview" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "outline" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "references" JSONB NOT NULL,
    "finalHtml" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiteratureReview_pkey" PRIMARY KEY ("id")
);

-- 创建ResearchDesign表
CREATE TABLE "ResearchDesign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "methodType" TEXT NOT NULL,
    "userDescription" TEXT NOT NULL,
    "designContent" JSONB NOT NULL,
    "hypothesesValidation" JSONB NOT NULL,
    "materials" JSONB NOT NULL,
    "actionPlan" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchDesign_pkey" PRIMARY KEY ("id")
);

-- 创建唯一约束
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "UsageLimit_userId_key" ON "UsageLimit"("userId");

-- 创建索引
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
CREATE INDEX "TopicGeneration_projectId_idx" ON "TopicGeneration"("projectId");
CREATE INDEX "TopicGeneration_createdAt_idx" ON "TopicGeneration"("createdAt");
CREATE INDEX "ApiCallLog_userId_idx" ON "ApiCallLog"("userId");
CREATE INDEX "ApiCallLog_projectId_idx" ON "ApiCallLog"("projectId");
CREATE INDEX "ApiCallLog_createdAt_idx" ON "ApiCallLog"("createdAt");
CREATE INDEX "ApiCallLog_route_idx" ON "ApiCallLog"("route");
CREATE INDEX "FrameworkGeneration_projectId_idx" ON "FrameworkGeneration"("projectId");
CREATE INDEX "FrameworkGeneration_createdAt_idx" ON "FrameworkGeneration"("createdAt");
CREATE INDEX "LiteratureReview_projectId_idx" ON "LiteratureReview"("projectId");
CREATE INDEX "LiteratureReview_createdAt_idx" ON "LiteratureReview"("createdAt");
CREATE INDEX "LiteratureReview_status_idx" ON "LiteratureReview"("status");
CREATE INDEX "ResearchDesign_projectId_idx" ON "ResearchDesign"("projectId");
CREATE INDEX "ResearchDesign_createdAt_idx" ON "ResearchDesign"("createdAt");
CREATE INDEX "ResearchDesign_status_idx" ON "ResearchDesign"("status");

-- 创建外键约束
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UsageLimit" ADD CONSTRAINT "UsageLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TopicGeneration" ADD CONSTRAINT "TopicGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FrameworkGeneration" ADD CONSTRAINT "FrameworkGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiteratureReview" ADD CONSTRAINT "LiteratureReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResearchDesign" ADD CONSTRAINT "ResearchDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
