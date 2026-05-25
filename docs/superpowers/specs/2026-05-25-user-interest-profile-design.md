# 用户兴趣画像 & 首次引导 — 设计文档

**日期：** 2026/05/25
**目标：** 从"热门项目浏览工具"升级为"中文开发者的 GitHub 项目翻译官 + 探嗅器"，核心差异化：基于用户兴趣画像的智能推荐 + 首次引导体验

---

## 1. 产品定位变更

| 维度 | 旧定位 | 新定位 |
|------|--------|--------|
| 一句话 | 帮助中文开发者探索 GitHub 热门项目 | **帮中文开发者读懂 GitHub 项目，发现值得关注的趋势** |
| 目标用户 | 所有中文开发者（太泛） | **1-3 年经验的中文开发者**（英语受限、想学但不知从何开始） |
| 核心价值 | 展示热门 + AI 翻译 | **探嗅热门/飙升项目 + AI 中文解读 + 基于兴趣的精准推荐** |
| 差异化 | 弱（和 GitHub Explore 重叠） | **中文语义理解 + 兴趣画像 + 探嗅（不是简单 Trending）** |

---

## 2. 用户痛点 → 功能映射

| 痛点 | 功能 | 优先级 |
|------|------|--------|
| 搜索需要很精准的关键词 | 中文自然语言搜索（P3，未来） | P3 |
| 打开项目看不懂 | AI 中文说明（已有） | ✅ |
| 不知道怎么探索感兴趣方向 | **首次引导 + 兴趣画像 + 智能推荐** | P0 |
| 热门项目为什么值得关注 | 热门快讯 + 推荐理由标签 | P1 |

---

## 3. 数据模型变更

### 3.1 扩展 `UserPreference`

```prisma
model UserPreference {
  id                  Int       @id @default(autoincrement())
  // 原有
  preferredLanguages  String    @default("[]")
  notifyEnabled       Boolean   @default(false)
  notifyInterval      Int       @default(60)
  lastNotifyAt        DateTime?
  pushSubscription    String?
  updatedAt           DateTime  @updatedAt

  // === 新增：兴趣画像 ===
  onboardingCompleted Boolean   @default(false)   // 是否完成首次引导
  role                String?                      // 身份角色
  experienceLevel     String?                      // 经验级别
  interests           String    @default("[]")     // 兴趣领域
  techStack           String    @default("[]")     // 当前技术栈
  goals               String    @default("[]")     // 学习目标
}
```

### 3.2 枚举值定义

**角色 (`role`)**：
| 值 | 中文 | 说明 |
|----|------|------|
| `frontend` | 前端工程师 | 专注 UI/UX、Web 开发 |
| `backend` | 后端工程师 | 专注 API、服务端、数据库 |
| `fullstack` | 全栈工程师 | 前后端都涉及 |
| `mobile` | 移动开发 | iOS/Android/跨平台 |
| `devops` | 运维/DevOps | 基础设施、CI/CD |
| `data` | 数据/AI | 数据科学、机器学习 |
| `student` | 学生 | 在校学习 |
| `other` | 其他 | — |

**经验级别 (`experienceLevel`)**：
| 值 | 中文 |
|----|------|
| `beginner` | 刚入门（0-1年） |
| `junior` | 初级（1-3年） |
| `mid` | 中级（3-5年） |
| `senior` | 高级（5年+） |

**兴趣领域 (`interests`)** — 可多选：
| 值 | 中文 | 匹配逻辑关键词 |
|----|------|---------------|
| `web-dev` | Web 开发 | react, vue, angular, nextjs, frontend |
| `api` | API / 微服务 | api, rest, graphql, microservice |
| `cli-tools` | 命令行工具 | cli, terminal, shell, command |
| `ai-ml` | AI / 机器学习 | ai, ml, deep-learning, llm, gpt |
| `data-engineering` | 数据工程 | data, etl, pipeline, analytics |
| `devops-infra` | 云原生 / DevOps | docker, k8s, cloud, ci-cd, infrastructure |
| `mobile-dev` | 移动开发 | ios, android, react-native, flutter |
| `game-dev` | 游戏开发 | game, unity, unreal, godot |
| `security` | 安全 | security, auth, encryption |
| `database` | 数据库 | database, sql, nosql, redis |
| `embedded` | 嵌入式 / IoT | embedded, iot, hardware |
| `oss` | 开源贡献 | open-source, contributing |

**技术栈 (`techStack`)** — 可多选 + 自由输入：
预设选项：`react`, `vue`, `angular`, `svelte`, `node`, `python`, `go`, `rust`, `java`, `swift`, `kotlin`, `typescript`, `docker`, `kubernetes`  
允许用户自定义添加。

**学习目标 (`goals`)** — 可多选：
| 值 | 中文 |
|----|------|
| `learn-new-framework` | 学习新框架/技术 |
| `find-tools` | 找好用的工具库 |
| `contribute-oss` | 参与开源贡献 |
| `read-source-code` | 阅读优秀源码 |
| `career-growth` | 职业发展提升 |
| `stay-updated` | 跟踪技术趋势 |

---

## 4. 首次引导流程（Onboarding Wizard）

### 4.1 触发条件

用户首次访问 → 检查 `onboardingCompleted`：
- `false` 或 `null` → 显示全屏引导 Wizard
- `true` → 正常进入主页

设置面板中可随时"重新设定兴趣"重新进入引导。

### 4.2 引导步骤

**步骤 1：「你是做什么的？」**
- 单选卡片：8 种角色
- 选中后高亮，点击下一步

**步骤 2：「你对什么感兴趣？」**
- 多选卡片：12 个兴趣领域
- 每个卡片有 emoji 图标 + 中文名
- 至少选 1 个才能进入下一步

**步骤 3：「你日常在用什么？」**
- 多选标签：预设 14 个常见技术 + 自由输入
- 自由输入框：回车添加自定义标签
- 可以不选直接跳过

### 4.3 完成后

- 保存到 `UserPreference`
- 设置 `onboardingCompleted = true`
- 自动跳转主页，推荐 Tab 基于新画像刷新

---

## 5. 推荐算法升级

### 5.1 现有算法（回顾）

```typescript
// 当前：仅基于偏好语言过滤 + stars 加权随机
getRecommendations({ preferredLanguages, limit, excludeProjectIds })
```

问题：太粗，只看语言，不看兴趣领域和技术栈。

### 5.2 新算法：兴趣画像加权匹配

```typescript
interface RecommendContext {
  role?: string
  experienceLevel?: string
  interests: string[]
  techStack: string[]
  goals: string[]
  limit: number
  excludeProjectIds?: string[]
}
```

**权重分配**：

| 维度 | 权重 | 说明 |
|------|------|------|
| 兴趣匹配 | 40% | 项目 topics/description 匹配用户兴趣领域 |
| 语言匹配 | 25% | 项目 primaryLanguage 在用户偏好语言或技术栈中 |
| 技术栈关联 | 20% | 项目与用户技术栈相关的项目（如用户用 react，推荐 next.js） |
| 探索发现 | 15% | 圈外项目，用于发现新领域 |

**匹配逻辑**：

1. **兴趣匹配**：项目的 `description` + `topics`（GitHub topics）与用户兴趣领域的关键词做交集计分
2. **语言匹配**：项目 `primaryLanguage` 是否在用户的 `preferredLanguages` ∪ `techStack` 中
3. **技术栈关联**：预设关联表，如 `react` → `[next.js, remix, vite, tailwindcss]`
4. **探索发现**：从非偏好语言/兴趣中随机抽取 star 最高的项目

**推荐理由标签**：

每个推荐项目附带匹配原因：
```typescript
interface RecommendReason {
  type: 'interest' | 'language' | 'techstack' | 'explore'
  label: string  // 如 "匹配你的 AI 兴趣"、"基于你的 React 技术栈"
}
```

### 5.3 技术栈关联映射表

```typescript
const TECH_RELATED: Record<string, string[]> = {
  react: ['next.js', 'remix', 'gatsby', 'vite', 'tailwindcss'],
  vue: ['nuxt', 'vite', 'pinia', 'vueuse'],
  python: ['django', 'flask', 'fastapi', 'pytorch', 'numpy'],
  node: ['express', 'fastify', 'prisma', 'typeorm'],
  go: ['gin', 'echo', 'fiber', 'grpc'],
  rust: ['tokio', 'actix', 'wasm', 'bevy'],
  java: ['spring', 'kotlin', 'gradle'],
  docker: ['kubernetes', 'helm', 'terraform', 'compose'],
  // ...
}
```

---

## 6. API 变更

### 6.1 现有 API 变更

**`GET /api/preferences`**

Response 扩展：
```json
{
  "preferredLanguages": ["TypeScript", "Python"],
  "notifyEnabled": false,
  "notifyInterval": 60,
  "onboardingCompleted": true,
  "role": "fullstack",
  "experienceLevel": "junior",
  "interests": ["web-dev", "ai-ml"],
  "techStack": ["react", "node", "python"],
  "goals": ["learn-new-framework", "find-tools"]
}
```

**`PUT /api/preferences`**

支持更新所有新字段。

### 6.2 新增 API

**`POST /api/preferences/init`**

首次引导完成时调用，一次性设置所有画像字段：

```json
// Request
{
  "role": "fullstack",
  "experienceLevel": "junior",
  "interests": ["web-dev", "ai-ml"],
  "techStack": ["react", "node"],
  "goals": ["learn-new-framework"]
}

// Response（同 GET /api/preferences）
```

设置 `onboardingCompleted = true`。

**`GET /api/recommend`**

新增 query 参数：
- `role` — 角色
- `interests` — 逗号分隔兴趣
- `techStack` — 逗号分隔技术栈
- `goals` — 逗号分隔目标
- 保留 `languages` 参数（兼容旧版）

Response 扩展：
```json
[
  {
    "project": { /* 完整 Project 对象 */ },
    "reason": {
      "type": "interest",
      "label": "匹配你的 AI 兴趣"
    }
  }
]
```

---

## 7. UI 变更

### 7.1 新增组件

| 组件 | 说明 |
|------|------|
| `OnboardingWizard` | 全屏 3 步引导，3 个子步骤组件 |
| `StepRole` | 步骤 1：角色选择 |
| `StepInterests` | 步骤 2：兴趣选择 |
| `StepTechStack` | 步骤 3：技术栈选择 |

### 7.2 修改组件

| 组件 | 变更 |
|------|------|
| `page.tsx` | 检查 `onboardingCompleted`，未完成则显示 Wizard |
| `PreferencesPanel` | 增加"重新设定兴趣"按钮 + 完整画像编辑 |
| `RecommendTab` | 标题改为"为你精选"，副标题展示匹配逻辑 |
| `ProjectCard` | 增加 `reason` 属性，显示推荐理由标签 |
| `usePreferences` | 扩展类型定义，增加所有新字段 |
| `useRecommend` | 传递完整画像信息，接收 reason |

### 7.3 首次引导 UI 设计

**视觉风格**：延续科技感主题（暗色毛玻璃卡片 + 电光边框）

**步骤指示器**：底部 3 个圆点，当前步骤高亮带脉冲动画

**步骤 1 — 角色选择**：
- 2×4 网格卡片
- 每个卡片：emoji + 中文名
- 选中：电光边框 + 放大
- 底部"下一步"按钮

**步骤 2 — 兴趣选择**：
- 3×4 网格卡片
- 每个卡片：emoji + 中文名
- 多选，至少选 1 个
- 选中：彩色边框 + 勾号
- 底部"下一步"按钮

**步骤 3 — 技术栈**：
- 预设标签云（多选标签）
- 底部输入框"添加自定义..."
- 回车添加自定义标签
- 底部"完成"按钮

---

## 8. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `prisma/schema.prisma` | 修改 | UserPreference 新增 5 个字段 |
| `src/lib/recommend.ts` | 修改 | 推荐算法升级（加权匹配 + 推荐理由） |
| `src/lib/interests.ts` | 新建 | 兴趣领域常量 + 关键词映射 + 技术栈关联 |
| `src/app/api/preferences/route.ts` | 修改 | GET/PUT 支持新字段 |
| `src/app/api/preferences/init/route.ts` | 新建 | POST 首次引导 |
| `src/app/api/recommend/route.ts` | 修改 | 接受新参数，返回推荐理由 |
| `src/hooks/usePreferences.ts` | 修改 | 扩展类型定义 |
| `src/hooks/useRecommend.ts` | 修改 | 传递完整画像信息 |
| `src/components/OnboardingWizard.tsx` | 新建 | 首次引导主组件 |
| `src/components/StepRole.tsx` | 新建 | 步骤 1 |
| `src/components/StepInterests.tsx` | 新建 | 步骤 2 |
| `src/components/StepTechStack.tsx` | 新建 | 步骤 3 |
| `src/components/PreferencesPanel.tsx` | 修改 | 增加画像编辑 |
| `src/components/ProjectCard.tsx` | 修改 | 增加推荐理由标签 |
| `src/components/RecommendTab.tsx` | 修改 | 标题/副标题更新 |
| `src/app/page.tsx` | 修改 | 引导逻辑 |

### 测试文件

| 文件 | 说明 |
|------|------|
| `__tests__/unit/recommend.test.ts` | 推荐算法加权匹配测试 |
| `__tests__/unit/usePreferences.test.ts` | 扩展 Hook 测试 |
| `__tests__/integration/api/preferences.test.ts` | API 扩展测试 |
| `__tests__/integration/api/preferences-init.test.ts` | 初始化 API 测试 |
| `__tests__/integration/api/recommend.test.ts` | 推荐理由返回测试 |
| `__tests__/e2e/onboarding.spec.ts` | 引导流程 E2E |

---

## 9. 迁移注意事项

- 数据库迁移：`UserPreference` 新增 5 个字段，均为可空或有默认值，**不影响现有数据**
- API 兼容：`GET /api/recommend` 保留 `languages` 参数，新参数可选，**向下兼容**
- 现有 `PreferencesPanel` 功能不受影响，新增字段 `onboardingCompleted = false` 表示未完成引导

---

## 10. 里程碑

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| Phase 1 | 数据库迁移 + API 扩展 + interests 常量 | P0 |
| Phase 2 | OnboardingWizard 组件（3 步引导） | P0 |
| Phase 3 | 推荐算法升级（加权匹配 + 推荐理由） | P0 |
| Phase 4 | PreferencesPanel 升级 + ProjectCard 推荐理由标签 | P1 |
| Phase 5 | 集成测试 + E2E | P0 |