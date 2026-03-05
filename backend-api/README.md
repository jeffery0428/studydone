# StudyDone Backend API (NestJS)

独立后端服务，面向前后端分离部署，提供论文检测相关 API：

- 用户认证（注册、登录、当前用户）
- 文档上传检测（Cloudflare R2 存储 + GPTZero 分析）
- 检测报告查询（列表 / 详情）
- Stripe 支付（checkout + webhook）
- MySQL 持久化（Prisma）

## 技术栈

- NestJS 11
- Prisma + MySQL
- Cloudflare R2（S3 兼容）
- GPTZero API
- JWT Bearer 认证

## 快速开始

```bash
cd backend-api
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run start:dev
```

默认启动：`http://localhost:4000/api`

## 目录结构

```text
backend-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── auth/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── config/
│   │   │   └── env.validation.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   └── modules/
│       ├── auth/
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   └── auth.service.ts
│       ├── check/
│       │   ├── check.controller.ts
│       │   ├── check.module.ts
│       │   ├── check.service.ts
│       │   └── gptzero.service.ts
│       ├── reports/
│       │   ├── reports.controller.ts
│       │   ├── reports.module.ts
│       │   └── reports.service.ts
│       └── storage/
│           ├── r2.service.ts
│           └── storage.module.ts
└── .env.example
```

## 主要接口

- `POST /api/auth/register` 注册
- `POST /api/auth/login` 登录（返回 `accessToken`）
- `GET /api/auth/me` 当前用户（需要 `Authorization: Bearer <token>`）
- `POST /api/check` 上传文件并检测（字段 `file`）
- `GET /api/reports` 报告列表
- `GET /api/reports/:id` 报告详情
- `POST /api/stripe/checkout` 创建支付链接
- `POST /api/stripe/webhook` Stripe 回调

## GPTZero 集成说明

- 服务实现位置：`src/modules/check/gptzero.service.ts`
- 默认请求地址：`${GPTZERO_BASE_URL}${GPTZERO_ENDPOINT}`
- 请求体：`{ paragraphs: string[] }`
- 返回值会被统一映射为：
  - `overallScore`
  - `segments[]`：`{ text, aiProbability, riskLevel, explanation }`

## Cloudflare R2 集成说明

- 服务实现位置：`src/modules/storage/r2.service.ts`
- 每次检测会先把原始文件上传到 R2，再写入 `reports.fileStorageKey`
- 便于后续人工复核、留档、再分析

## 额度扣费机制（Reserve / Commit / Rollback）

为防并发扣费，检测流程升级为三阶段：

1. **Reserve**：创建 `credit_reservations`（`status=reserved`，10分钟过期）  
2. **Run Detection**：执行文本提取、GPTZero 检测、R2 上传  
3. **Commit / Rollback**：  
   - 成功：`status=committed`，并扣减 `users.checkQuota`  
   - 失败：`status=cancelled`，不扣减用户额度

另外系统包含定时任务：

- 每分钟自动清理 `expired` 的 `reserved` 记录，改为 `cancelled`
- 防止由于异常中断导致额度长期冻结

核心表：

- `credit_reservations`：`id`, `user_id`, `amount`, `status`, `task_id`, `expires_at`, `created_at`

## 与前端对接

前端可通过 `NEXT_PUBLIC_API_BASE_URL=https://api.studydone.vip` 直接切换到此后端。  
前端登录后需保存 `accessToken` 并在请求头带上：

```text
Authorization: Bearer <accessToken>
```

> 注意：此版本认证方式为 JWT Bearer。若你要继续沿用 Cookie 登录，只需在 `auth` 模块补充 cookie 写入与读取逻辑即可。

