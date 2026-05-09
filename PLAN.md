# GitHub AI Explorer — TDD 开发计划

**日期：** 2026/05/09  
**模式：** TDD（测试驱动开发）  
**技术栈：** Next.js App Router + shadcn/ui + Tailwind + Prisma + SQLite + OpenAI SDK 通用客户端 + node-cron + Web Push

---

## 0. 关键决策确认

| 决策项 | 方案 |
|--------|------|
| 目录结构 | `D:\codeproject\github-ai-explorer/` 子目录 |
| UI 组件 | shadcn/ui |
| 测试框架 | Vitest（单元/集成）+ Playwright（E2E） |
| LLM 接入 | OpenAI SDK 通用客户端（`baseURL` + `apiKey` + `model` 三变量配置，兼容所有 OpenAI-compatible 服务商） |
| Trending 来源 | GitHub Search API（`sort:stars` 模拟），`Project` 模型预留 `source` 字段 |
| 定时任务 | 应用内 `node-cron` 启动 |
| 用户模型 | 单用户（`UserPreference` 无 `userId`） |

---

## 1. 项目初始化与环境搭建（Phase 0）

> **非 TDD 阶段**：初始化脚手架和配置，为后续 TDD 建立基础。

### 1.1 创建 Next.js 项目（子目录）

```bash
# 在 D:\codeproject 下执行
npx shadcn@latest init --yes --template next --base-color slate github-ai-explorer
```

### 1.2 安装依赖

```bash
# TDD 测试
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test

# 后端
npm install prisma @prisma/client node-cron web-push openai
npm install -D @types/node-cron @types/web-push

# shadcn 组件（按需）
npx shadcn add button card badge dialog tabs input select switch checkbox scroll-area separator skeleton
```

### 1.3 配置文件

- `vitest.config.ts` — 配置 Vitest + React Testing Library
- `playwright.config.ts` — 配置 Playwright E2E
- `prisma/schema.prisma` — 按设计文档定义 3 个模型
- `.env` / `.env.example` — 环境变量
- `src/lib/db.ts` — Prisma Client 单例

### 1.4 目录结构

```
github-ai-explorer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Route Handlers
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── NavBar.tsx
│   │   ├── TrendingTab.tsx
│   │   ├── SearchTab.tsx
│   │   ├── RecommendTab.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDrawer.tsx
│   │   ├── LanguageFilter.tsx
│   │   └── PreferencesPanel.tsx
│   ├── hooks/
│   │   ├── useTrending.ts
│   │   ├── useSearch.ts
│   │   └── usePreferences.ts
│   ├── lib/
│   │   ├── db.ts              # Prisma Client
│   │   ├── api.ts             # 前端 API 封装
│   │   ├── github.ts          # GitHub API 封装
│   │   ├── llm.ts             # LLM 通用客户端
│   │   ├── webpush.ts         # Web Push 封装
│   │   └── cron.ts            # 定时任务逻辑
│   └── __tests__/             # 测试文件
│       ├── unit/
│       ├── integration/
│       └── e2e/               # Playwright tests
├── prisma/
│   └── schema.prisma
├── public/
│   └── sw.js                  # Service Worker
├── vitest.config.ts
├── playwright.config.ts
└── .env.example
```

### 1.5 环境变量（`.env.example`）

```bash
DATABASE_URL="file:./dev.db"
GITHUB_TOKEN=

LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:you@example.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

---

## 2. TDD 开发阶段（Phase 1~7）

每个 Phase 遵循 **红-绿-重构** 循环：

```
1. 写测试 → 测试失败（红）
2. 写最小实现 → 测试通过（绿）
3. 重构优化 → 保持通过（重构）
```

---

### Phase 1：数据层 + API 骨架

**目标**：数据库连接、模型定义、基础 API 响应。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/db.test.ts` | Prisma Client 能正确初始化，能读写 SQLite |
| `__tests__/integration/api/health.test.ts` | `GET /api/health` 返回 200 |

#### 实现步骤

1. **红**：写 `db.test.ts` — 断言能创建并读取一个 `Project` 记录
2. **绿**：配置 `prisma/schema.prisma`，执行 `npx prisma migrate dev --name init`，实现 `db.ts`
3. **重构**：确认 Prisma Client 单例模式正确
4. **红**：写 `health.test.ts` — 断言 `/api/health` 返回 `{ status: 'ok' }`
5. **绿**：创建 `src/app/api/health/route.ts` 返回 200
6. **重构**：提取 API 响应工具函数

**交付物**：
- Prisma schema（Project / UserPreference / PushLog）
- 数据库迁移文件
- `src/lib/db.ts`
- `src/app/api/health/route.ts`
- 全部测试通过

---

### Phase 2：GitHub Trending 抓取与展示

**目标**：从 GitHub Search API 抓取项目，存入数据库，前端展示。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/github.test.ts` | `fetchGitHubSearch()` 正确调用 Search API，返回格式化项目数组 |
| `__tests__/integration/api/trending.test.ts` | `POST /api/trending/fetch` 触发抓取并入库；`GET /api/trending` 返回列表 |
| `__tests__/unit/useTrending.test.ts` | `useTrending` hook 正确管理加载态、数据、错误 |
| `__tests__/e2e/trending.spec.ts` | 访问首页 → 看到 Trending 项目卡片 |

#### 实现步骤

1. **红**：写 `github.test.ts` — mock GitHub API，断言返回包含 `name`, `stars`, `language` 的数组
2. **绿**：实现 `src/lib/github.ts` 的 `fetchGitHubSearch()` 函数
3. **重构**：处理 rate limit、错误重试
4. **红**：写 `trending.test.ts` — `POST` 触发抓取后数据库有记录；`GET` 支持 `language` 和 `since` 查询参数
5. **绿**：实现 `src/app/api/trending/fetch/route.ts` 和 `src/app/api/trending/route.ts`
6. **重构**：抽取服务层逻辑到 `src/lib/trending.ts`
7. **红**：写 `useTrending.test.ts` — mock API，断言 hook 返回数据和 loading 状态
8. **绿**：实现 `src/hooks/useTrending.ts`
9. **红**：写 `trending.spec.ts` — Playwright 访问 `/`，断言页面有 "热门榜单" 和项目卡片
10. **绿**：实现 `src/app/page.tsx`（首页，含 Tab 切换）、`src/components/TrendingTab.tsx`、`src/components/ProjectCard.tsx`、`src/components/LanguageFilter.tsx`
11. **重构**：组件拆分、加载态优化

**交付物**：
- GitHub Search API 封装
- `POST /api/trending/fetch` + `GET /api/trending`
- 前端 Trending Tab + 语言筛选 + 时间范围切换
- E2E 测试：首页能看到项目卡片

---

### Phase 3：搜索功能

**目标**：关键词搜索 + 高级筛选。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/integration/api/search.test.ts` | `GET /api/search?q=react&language=typescript&minStars=1000` 返回正确结果 |
| `__tests__/unit/useSearch.test.ts` | `useSearch` hook 支持关键词和筛选条件 |
| `__tests__/e2e/search.spec.ts` | 在搜索页输入关键词 → 显示过滤后的结果 |

#### 实现步骤

1. **红**：写 `search.test.ts` — 断言 API 支持 `q`、`language`、`minStars`、`updatedAfter` 参数
2. **绿**：实现 `src/app/api/search/route.ts`，从数据库模糊查询 + 筛选
3. **重构**：优化 Prisma 查询性能（加索引）
4. **红**：写 `useSearch.test.ts` — 断言 hook 管理搜索表单状态和结果
5. **绿**：实现 `src/hooks/useSearch.ts`
6. **红**：写 `search.spec.ts` — Playwright 在 Search Tab 输入关键词，断言结果变化
7. **绿**：实现 `src/components/SearchTab.tsx`（搜索框 + 高级筛选面板）
8. **重构**：表单校验、防抖优化

**交付物**：
- `GET /api/search`
- 前端 Search Tab + 高级筛选
- E2E 测试：搜索流程可用

---

### Phase 4：AI 项目说明（LLM 集成）

**目标**：点开项目详情，按需生成中文 AI 说明。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/llm.test.ts` | `generateSummary(project)` 调用 OpenAI SDK，传入正确 prompt，返回中文说明 |
| `__tests__/integration/api/summarize.test.ts` | `POST /api/projects/[id]/summarize` 生成并缓存 aiSummary；重复调用直接返回缓存 |
| `__tests__/unit/useProject.test.ts` | hook 正确获取项目详情，触发 summarize |
| `__tests__/e2e/drawer.spec.ts` | 点击项目卡片 → 抽屉打开 → 显示 AI 说明 |

#### 实现步骤

1. **红**：写 `llm.test.ts` — mock OpenAI SDK，断言 prompt 包含项目名称、描述、语言、Stars，返回字符串
2. **绿**：实现 `src/lib/llm.ts`（通用客户端，读取 `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`）
3. **重构**：添加重试机制、超时控制
4. **红**：写 `summarize.test.ts` — 断言 `POST` 后数据库 `aiSummary` 字段更新，`aiSummaryGeneratedAt` 记录时间
5. **绿**：实现 `src/app/api/projects/[id]/summarize/route.ts`
6. **重构**：预热逻辑（定时对 Trending 前 20 名预生成）
7. **红**：写 `useProject.test.ts` — 断言获取详情后自动触发 summarize（如果无缓存）
8. **绿**：实现 `src/hooks/useProject.ts`
9. **红**：写 `drawer.spec.ts` — Playwright 点击卡片，断言抽屉打开并包含 "AI 说明"
10. **绿**：实现 `src/components/ProjectDrawer.tsx`
11. **重构**：加载态、错误态、空状态处理

**交付物**：
- LLM 通用客户端（兼容所有 OpenAI-compatible 服务商）
- `POST /api/projects/[id]/summarize`
- 项目详情抽屉（含 AI 说明）
- E2E 测试：AI 说明生成流程

---

### Phase 5：个性化推荐

**目标**：基于偏好语言的 AI 推荐。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/recommend.test.ts` | `getRecommendations(preferredLanguages)` 按语言过滤，加权随机，混入 1-2 个探索项 |
| `__tests__/integration/api/recommend.test.ts` | `GET /api/recommend` 返回推荐列表；`POST /api/recommend/refresh` 返回不同列表 |
| `__tests__/e2e/recommend.spec.ts` | 切换到 AI 推荐 Tab → 看到基于偏好的推荐卡片 |

#### 实现步骤

1. **红**：写 `recommend.test.ts` — mock 数据库项目，断言返回数量、语言分布、排除已推送（PushLog）
2. **绿**：实现 `src/lib/recommend.ts`（推荐算法）
3. **重构**：优化加权随机算法
4. **红**：写 `recommend.test.ts`（集成）— 断言 API 返回格式正确
5. **绿**：实现 `GET /api/recommend` 和 `POST /api/recommend/refresh`
6. **红**：写 `recommend.spec.ts` — Playwright 断言推荐 Tab 有卡片，点击 "换一批" 内容变化
7. **绿**：实现 `src/components/RecommendTab.tsx`
8. **重构**：卡片动画、空状态

**交付物**：
- 推荐算法（偏好过滤 + 加权随机 + 探索混入）
- `GET /api/recommend` + `POST /api/recommend/refresh`
- 前端 Recommend Tab
- E2E 测试：推荐流程

---

### Phase 6：用户偏好设置

**目标**：语言偏好、通知开关、推送间隔。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/integration/api/preferences.test.ts` | `GET /api/preferences` 返回默认值；`PUT /api/preferences` 更新成功 |
| `__tests__/unit/usePreferences.test.ts` | hook 管理偏好表单，调用 API |
| `__tests__/e2e/preferences.spec.ts` | 打开设置面板 → 修改偏好 → 保存成功 |

#### 实现步骤

1. **红**：写 `preferences.test.ts` — 断言 GET 返回默认 `preferredLanguages`、`notifyEnabled`；PUT 后数据库更新
2. **绿**：实现 `GET /api/preferences/route.ts` 和 `PUT /api/preferences/route.ts`
3. **重构**：输入校验（zod）
4. **红**：写 `usePreferences.test.ts` — 断言 hook 管理表单状态、调用 API
5. **绿**：实现 `src/hooks/usePreferences.ts`
6. **红**：写 `preferences.spec.ts` — Playwright 点击设置 → 修改语言偏好 → 保存 → 推荐 Tab 更新
7. **绿**：实现 `src/components/PreferencesPanel.tsx`
8. **重构**：表单交互优化

**交付物**：
- `GET/PUT /api/preferences`
- 前端偏好设置面板
- E2E 测试：偏好设置流程

---

### Phase 7：Web Push 推送通知

**目标**：Service Worker、订阅管理、定时推送。

#### 测试清单

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/webpush.test.ts` | `sendPushNotification(subscription, payload)` 调用 `web-push` 库 |
| `__tests__/integration/api/push.test.ts` | `POST /api/push/subscribe` 保存订阅；`POST /api/push/send` 触发推送 |
| `__tests__/unit/cron.test.ts` | 定时任务逻辑：读取偏好 → 筛选项目 → 生成/复用 AI 理由 → 发送 → 写日志 |
| `__tests__/e2e/push.spec.ts` | 点击通知开关 → 浏览器请求权限 → 订阅成功 |

#### 实现步骤

1. **红**：写 `webpush.test.ts` — mock `web-push`，断言传入正确参数
2. **绿**：实现 `src/lib/webpush.ts` 封装
3. **重构**：错误处理（无效订阅时移除）
4. **红**：写 `push.test.ts`（集成）— 断言订阅保存到 `UserPreference.pushSubscription`
5. **绿**：实现 `POST /api/push/subscribe/route.ts`
6. **红**：写 `push.test.ts`（集成）— 断言 `POST /api/push/send` 触发推送并写入 `PushLog`
7. **绿**：实现 `POST /api/push/send/route.ts`
8. **红**：写 `cron.test.ts` — mock 时间，断言定时任务按间隔触发，正确筛选和推送
9. **绿**：实现 `src/lib/cron.ts`，在 `layout.tsx` 或独立入口启动 `node-cron`
10. **红**：写 `push.spec.ts` — Playwright 断言点击通知开关后，浏览器出现权限请求
11. **绿**：实现 `public/sw.js`（Service Worker）、前端 `PushManager` 订阅逻辑、通知开关按钮
12. **重构**：推送内容格式化、错误恢复

**交付物**：
- Web Push 完整链路（Service Worker → 订阅 → 发送）
- 定时任务（node-cron）推送逻辑
- 推送开关 UI
- E2E 测试：订阅流程

---

## 3. 集成收尾（Phase 8）

### 3.1 全量回归

```bash
npm run test        # Vitest 单元 + 集成
npm run test:e2e    # Playwright E2E
```

### 3.2 性能优化

- `Project` 表加索引：`primaryLanguage`、`trendingDate`、`stars`
- AI 说明缓存：预热前 20 名 Trending
- 前端：React.memo 卡片、虚拟滚动（如果列表很长）

### 3.3 代码清理

- 删除所有 `console.log`
- 统一错误处理
- TypeScript `strict` 模式零报错

---

## 4. 测试命令速查

```bash
# 开发模式（监听）
npm run test:unit -- --watch

# 单次运行
npm run test:unit

# E2E（需要 dev server 在运行）
npm run dev
npm run test:e2e

# E2E UI 模式（调试）
npm run test:e2e -- --ui
```

---

## 5. MVP 交付检查清单

| 功能 | Phase | 测试覆盖 |
|------|-------|----------|
| GitHub Trending 抓取 + 展示 | Phase 2 | 单元 + 集成 + E2E |
| 关键词搜索 + 高级筛选 | Phase 3 | 单元 + 集成 + E2E |
| AI 中文项目说明（可切换 LLM 提供商） | Phase 4 | 单元 + 集成 + E2E |
| 个性化推荐（基于偏好语言） | Phase 5 | 单元 + 集成 + E2E |
| Web Push 推送通知 | Phase 7 | 单元 + 集成 + E2E |
| 用户偏好设置界面 | Phase 6 | 单元 + 集成 + E2E |
| 项目详情抽屉（含 AI 说明） | Phase 4 | E2E |
| SQLite 数据持久化 | Phase 1~7 | 全部 |

---

## 附录：参考文档

- 设计文档：`../docs/superpowers/specs/2026-05-09-github-ai-explorer-design.md`
