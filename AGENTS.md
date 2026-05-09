# GitHub AI Explorer — Agent Instructions

## Quick Context

全栈 Web 应用（Next.js App Router），帮助中文开发者探索 GitHub 热门项目。核心功能：Trending 抓取、AI 中文说明、个性化推荐、Web Push 通知。

开发模式：**TDD（测试驱动开发）**，红→绿→重构循环。

## Architecture

```
浏览器 (Next.js 前端)
       ↕ HTTP
Next.js Route Handlers (API)
       ↕ Prisma
SQLite ←→ GitHub Search API
       ↕
   LLM API (OpenAI-compatible)
```

- **单用户应用**：`UserPreference` 表无 `userId`，只有一条全局偏好记录
- **Trending 数据来源**：GitHub Search API（`sort:stars` 模拟），非官方 Trending API
- **LLM 接入**：OpenAI SDK 通用客户端，通过 `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL` 三变量兼容所有 OpenAI-compatible 服务商

## Directory Layout

```
github-ai-explorer/
├── src/
│   ├── app/                 # Next.js App Router 页面 + API Routes
│   │   ├── api/health/
│   │   ├── api/trending/
│   │   ├── api/projects/[id]/summarize/   # 动态路由
│   │   ├── api/search/
│   │   ├── api/recommend/
│   │   ├── api/preferences/
│   │   └── api/push/
│   ├── components/          # React 组件（含 shadcn/ui）
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具库（db, github, llm, webpush, cron, recommend, trending）
│   └── __tests__/
│       ├── unit/            # Vitest 单元测试
│       ├── integration/api/ # API 集成测试
│       └── e2e/             # Playwright E2E
├── prisma/schema.prisma     # 数据模型
├── public/sw.js             # Service Worker（Web Push）
├── PLAN.md                  # TDD 开发计划（Phase 0~8）
└── .env.example             # 环境变量模板
```

## Required Environment Variables

```bash
DATABASE_URL="file:./dev.db"
GITHUB_TOKEN=                 # GitHub Personal Access Token

LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini

VAPID_PUBLIC_KEY=             # web-push VAPID
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:you@example.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY= # 前端订阅用
```

## Development Workflow (TDD)

每个功能按 **红→绿→重构** 循环：

1. 写测试（红）
2. 写最小实现（绿）
3. 重构优化（保持通过）

### Commands

```bash
# 开发服务器
npm run dev

# 单元/集成测试（Vitest）
npm run test:unit
npm run test:unit -- --watch    # 监听模式

# E2E 测试（Playwright，需 dev server 运行）
npm run test:e2e
npm run test:e2e -- --ui       # UI 调试模式

# Prisma
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma studio
```

## Key Constraints

- **不写代码前必须先写测试**：这是硬约束，TDD 模式
- **单用户**：所有偏好/订阅只有一条记录，不需要认证登录
- **LLM Provider 兼容**：只用 OpenAI SDK 的 `baseURL` 参数切换服务商，不要引入多个 SDK
- **GitHub Trending 模拟**：Search API + `sort:stars` + 时间过滤，不要爬取 HTML
- **定时任务**：应用内 `node-cron` 启动，不是外部 cron 或 Vercel Cron Jobs
- **数据模型**：`Project` 预留 `source` 字段，方便后续扩展其他数据源

## Important Files for Agents

| 文件 | 作用 |
|------|------|
| `PLAN.md` | 完整 TDD 开发计划（Phase 0~8），按 Phase 顺序执行 |
| `prisma/schema.prisma` | 数据库模型：Project / UserPreference / PushLog |
| `.env.example` | 环境变量完整清单 |
| `docs/superpowers/specs/2026-05-09-github-ai-explorer-design.md` | 原始设计文档（在工作区根目录 `docs/` 下） |

## Testing Quirks

- Playwright E2E 需要 `npm run dev` 在后台运行
- `cron.test.ts` 需要 mock `Date` 或 `node-cron` 来避免真实定时等待
- `llm.test.ts` 必须 mock OpenAI SDK，不要真实调用 API
- Web Push E2E 测试可能需要浏览器权限弹窗处理

## shadcn/ui Components

按需安装，已规划：
```bash
npx shadcn add button card badge dialog tabs input select switch checkbox scroll-area separator skeleton
```

## Notes

- 项目框架已创建（空文件），Phase 0 初始化尚未执行（`npx shadcn@latest init` 等）
- 所有代码文件当前为空，等待按 PLAN.md Phase 顺序填充
- `AGENTS.md` 位于项目子目录 `github-ai-explorer/`，不是工作区根目录
