# AWS 生产部署指南

## 基础设施
- 应用：ECS Fargate（ALB 负载均衡）
- 数据库：RDS PostgreSQL 15
- 缓存：ElastiCache Redis 7
- 存储：S3（静态与备份）
- CDN：CloudFront（绑定 ACM 证书）
- 域名：Route 53

## 环境与镜像
- ECR：创建仓库并推送镜像
- Secrets Manager：保存敏感配置
  - `sssci/DATABASE_URL`
  - `sssci/NEXTAUTH_SECRET`
  - `sssci/OPENAI_API_KEY`
  - 可选：`sssci/GOOGLE_CLIENT_ID`、`sssci/GOOGLE_CLIENT_SECRET`、`sssci/GITHUB_ID`、`sssci/GITHUB_SECRET`、`sssci/SEMANTIC_SCHOLAR_API_KEY`、`sssci/SERPAPI_API_KEY`

## ECS 任务定义示例
```json
{
  "family": "sssci-web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/sssciTaskRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/sssci:latest",
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "essential": true,
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:<region>:<account>:secret:sssci/DATABASE_URL" },
        { "name": "NEXTAUTH_SECRET", "valueFrom": "arn:aws:secretsmanager:<region>:<account>:secret:sssci/NEXTAUTH_SECRET" },
        { "name": "OPENAI_API_KEY", "valueFrom": "arn:aws:secretsmanager:<region>:<account>:secret:sssci/OPENAI_API_KEY" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sssci-web",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "app"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:3000/api/health || exit 1"],
        "interval": 15,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ]
}
```

## ALB 与 Target Group
- 创建 ALB（公网），监听 `443`（ACM 证书）与 `80`（重定向到 `443`）
- 创建 Target Group（类型：IP，端口 `3000`）
  - 健康检查路径：`/api/health`
  - 健康阈值：`healthy=3`、`unhealthy=3`
  - 超时与间隔：`timeout=5s`、`interval=15s`
- ECS 服务绑定到 Target Group；最小/最大副本根据负载配置

## RDS PostgreSQL
- 版本：PostgreSQL 15，开启自动备份（保留 30 天）
- 安全组：允许 ECS 子网出站访问数据库端口 `5432`
- 参数：启用 `performance_insights`（可选）

## ElastiCache Redis
- 引擎：Redis 7，单节点或集群（视吞吐需求）
- 安全组：允许 ECS 子网出站访问端口 `6379`

## S3 与 CloudFront
- S3：用于静态资源与备份，开启版本化
- CloudFront：加速静态与边缘代理，绑定域名与 ACM 证书

## CI/CD（GitHub Actions）
- 工作流：`.github/workflows/deploy.yml`
- 仓库 Secrets：
  - `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION`
  - `ECR_REGISTRY`、`ECR_REPOSITORY`
  - `ECS_CLUSTER`、`ECS_SERVICE`
- 流程：测试 → 构建 → 推送 ECR → 更新 ECS

## 迁移策略
- 生产迁移推荐使用独立 Job/Task 执行：
  - 运行一次性任务定义（同镜像），命令：`npx prisma migrate deploy`
  - 或在部署后手动 SSH/SSM 进入容器执行
- 开发环境在 Compose 中自动 `migrate dev`

## 监控与告警
- CloudWatch Metrics：CPU/内存、请求量与延迟、错误率
- Logs：ECS 任务写入 `/ecs/sssci-web`
- Alarms：阈值推送 SNS/邮件；成本与错误率在应用监控页 `/admin/monitoring`

## 备份
- RDS：自动快照 + 手动快照（发布前）
- 用户数据：定期导出 S3（版本化）

## 扩展
- ECS 自动扩展：基于 CPU/内存或 ALB 请求数
- RDS：读副本（如读压力大）

## 域名与证书
- Route 53 管理域名记录，ALB/CloudFront 绑定 ACM 证书，启用 HTTPS

## 快速检查清单
- ECR 镜像最新且可拉取
- ECS 任务定义引用 Secrets 正确
- ALB 健康检查通过（`/api/health` 200）
- RDS 与 Redis 安全组放通
- CloudWatch 日志可见
- GitHub Actions 部署成功且服务已更新