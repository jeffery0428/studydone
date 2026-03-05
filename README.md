# StudyDone - AI 痕迹检测

专注学生、教师群体的论文 AI 痕迹检测网站，参照 [JustDone AI Detector](https://justdone.com/ai-detector) 设计。

## 功能特性

### 1️⃣ 用户系统
- 注册 / 登录
- 查重次数记录
- 身份选择（学生 / 教师）

### 2️⃣ 文档处理
- 支持 **docx**、**pdf**、**txt** 格式
- 自动提取文本
- 分段分析

### 3️⃣ 报告展示
- 整体 AI 概率
- 段落风险标记（低 / 中 / 高）
- 风险解释

### 4️⃣ 支付
- Stripe 集成
- 套餐购买（5 / 50 / 200 次）

## 技术栈（前后端分离架构规划）

- **前端**: Next.js 15（本仓库），仅负责页面展示与调用后端 API
- **后端（建议新建独立服务，如 NestJS / FastAPI 等）**  
  - API 域名：`https://api.studydone.vip`  
  - **数据库**: MySQL（存储用户、报告、订单等），使用 Prisma / ORM 访问  
  - **文件存储**: Cloudflare R2（存储上传的论文文件、解析结果备份）  
  - **AI 检测**: GPTZero API（对提取后的文本做 AI 痕迹检测）  
  - **认证**: JWT（后端签发，前端通过 Cookie / Authorization Header 携带）

当前仓库内已新增 `backend-api`（NestJS）独立后端实现，前端推荐通过 `NEXT_PUBLIC_API_BASE_URL` 对接该服务。

## 快速开始（前端）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_xxx"        # Stripe 测试密钥
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"      # Webhook 密钥
NEXT_PUBLIC_APP_URL="https://studydone.vip"
NEXT_PUBLIC_API_BASE_URL="https://api.studydone.vip"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. （推荐）对接独立后端

```env
NEXT_PUBLIC_API_BASE_URL="https://api.studydone.vip"
```

前端登录后会保存后端返回的 `accessToken`，后续请求通过 `Authorization: Bearer <token>` 调用后端 API。

## 后端架构规划（MySQL + R2 + GPTZero）

### 1. API 分层设计

- **认证与用户**  
  - `POST /api/auth/register` 注册（写 MySQL `users` 表）  
  - `POST /api/auth/login` 登录，签发 JWT  
  - `GET /api/auth/me` 获取当前用户信息  
- **检测任务**  
  - `POST /api/check`  
    - 接收文件上传  
    - 将原始文件上传到 Cloudflare R2，返回 `r2_key`  
    - 从文件中提取纯文本（docx/pdf/txt）  
    - 调用 GPTZero API 获取 AI 概率 & 段落级结果  
    - 把报告结果写入 MySQL `reports` 表（仅存文本片段和 GPTZero 返回的结构化结果）  
  - `GET /api/reports` 获取当前用户的报告列表  
  - `GET /api/reports/:id` 获取单个报告详情  
- **支付与套餐（可沿用 Stripe 逻辑）**  
  - `POST /api/stripe/checkout` 创建支付会话  
  - `POST /api/stripe/webhook` Webhook 回调，增加用户查重次数（写 MySQL `subscriptions` / `users.check_quota`）

### 2. 数据库（MySQL）示例结构

- `users`：`id`, `email`, `password_hash`, `role`, `check_quota`, `created_at` …  
- `reports`：`id`, `user_id`, `file_name`, `r2_key`, `overall_score`, `segments_json`, `created_at` …  
- `subscriptions`：`id`, `user_id`, `stripe_session_id`, `plan`, `quota`, `created_at` …

可以直接参考当前 `prisma/schema.prisma` 的模型，将 `provider` 从 `sqlite` 改为 `mysql`，并配置：

```env
DATABASE_URL="mysql://user:password@host:3306/studydone"
```

### 3. Cloudflare R2 文件存储

- 在 Cloudflare R2 创建 Bucket（如 `studydone-files`）  
- 后端在 `POST /api/check` 中：
  1. 接收文件流，先上传到 R2（使用 `@aws-sdk/client-s3` 兼容接口）  
  2. 记录 `r2_key`（例如 `userId/yyyy/MM/dd/uuid.ext`）到 `reports` 表  
  3. 再从文件流或 R2 读取内容做文本解析

前端不直接访问 R2，由后端负责签名和访问控制。

### 4. GPTZero API 集成

- 后端持有 GPTZero 的 API Key（保存在服务端环境变量中）  
- 在 `POST /api/check` 中，提取文本后调用 GPTZero，例如：
  - 请求体包含：`text` 或 `paragraphs[]`  
  - 响应：整体 AI 概率 + 每个段落的概率 / 标记  
- 后端将 GPTZero 返回结果转换为现在前端使用的结构：
  - `overallScore`（0–1 / 0–100）  
  - `segments[]`：`{ text, aiProbability, riskLevel, explanation }`

前端目前已经通过 `NEXT_PUBLIC_API_BASE_URL` 支持独立 API 域名，只要把该变量设置为后端地址（例如 `https://api.studydone.vip`），并在后端实现相同路径的 REST 接口即可无缝切换。

## Stripe 配置

1. 在 [Stripe Dashboard](https://dashboard.stripe.com) 创建产品与价格
2. 将 Price ID 填入 `src/app/api/stripe/checkout/route.ts` 的 `PLANS` 对象
3. 配置 Webhook 指向 `/api/stripe/webhook`，监听 `checkout.session.completed`

## 项目结构

```
src/
├── app/
│   ├── api/           # API 路由
│   │   ├── auth/      # 注册、登录、登出
│   │   ├── check/     # 文档检测
│   │   ├── reports/   # 报告列表与详情
│   │   └── stripe/    # 支付与 Webhook
│   ├── dashboard/     # 检测中心
│   ├── login/
│   ├── register/
│   ├── pricing/       # 套餐页
│   └── page.tsx       # 首页
├── components/
└── lib/               # 工具与业务逻辑
```

## License

MIT
