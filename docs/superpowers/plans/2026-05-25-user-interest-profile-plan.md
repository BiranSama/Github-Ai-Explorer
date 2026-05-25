# 用户兴趣画像 & 首次引导 — TDD 开发计划

**日期：** 2026/05/25
**设计文档：** `docs/superpowers/specs/2026-05-25-user-interest-profile-design.md`
**模式：** TDD（红→绿→重构）

---

## Phase 1：数据层 + 兴趣常量 + API

### 1.1 数据库迁移

```bash
npx prisma migrate dev --name add-user-interest-profile
```

`UserPreference` 新增字段：
- `onboardingCompleted Boolean @default(false)`
- `role String?`
- `experienceLevel String?`
- `interests String @default("[]")`
- `techStack String @default("[]")`
- `goals String @default("[]")`

### 1.2 TDD 步骤

#### 红：写测试

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/interests.test.ts` | 验证兴趣常量、关键词映射、技术栈关联表完整性 |
| `__tests__/integration/api/preferences.test.ts` | GET 返回新字段默认值；PUT 更新新字段 |
| `__tests__/integration/api/preferences-init.test.ts` | POST /api/preferences/init 设置画像 + onboardingCompleted=true；重复调用仍返回 200 |

#### 绿：最小实现

| 文件 | 说明 |
|------|------|
| `src/lib/interests.ts` | 角色、经验、兴趣、技术栈、目标的常量定义 + 关键词映射 + 技术栈关联 |
| `prisma/schema.prisma` | 新增 5 个字段 |
| `src/app/api/preferences/route.ts` | GET/PUT 支持新字段 |
| `src/app/api/preferences/init/route.ts` | POST 初始化画像 |

#### 重构

- 提取 `src/lib/profile.ts`：画像类型定义 + 校验函数
- `preferences/route.ts` 复用 `profile.ts` 的校验

**交付物**：
- 数据库迁移文件
- `src/lib/interests.ts`
- `src/app/api/preferences/init/route.ts`
- 全部测试通过

---

## Phase 2：OnboardingWizard 组件

### 2.1 TDD 步骤

#### 红：写测试

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/usePreferences.test.ts` | Hook 返回新字段；`initProfile()` 调用 POST /api/preferences/init |
| `__tests__/e2e/onboarding.spec.ts` | 首次访问无 onboardingCompleted → 显示引导；完成 3 步 → 跳转主页；已有 onboardingCompleted → 直接进主页 |

#### 绿：最小实现

| 文件 | 说明 |
|------|------|
| `src/components/OnboardingWizard.tsx` | 全屏引导容器（步骤管理 + 状态） |
| `src/components/StepRole.tsx` | 角色选择步骤 |
| `src/components/StepInterests.tsx` | 兴趣选择步骤 |
| `src/components/StepTechStack.tsx` | 技术栈选择步骤 |
| `src/hooks/usePreferences.ts` | 扩展类型 + `initProfile()` 方法 |
| `src/app/page.tsx` | 检查 onboardingCompleted，条件渲染 Wizard |

#### 重构

- 提取步骤组件共享的 `SelectableCard` 子组件
- 步骤指示器独立组件

**交付物**：
- 完整 3 步引导 UI
- 首次访问自动触发
- E2E 测试通过

---

## Phase 3：推荐算法升级

### 3.1 TDD 步骤

#### 红：写测试

| 测试文件 | 描述 |
|----------|------|
| `__tests__/unit/recommend.test.ts` | 测试加权匹配：兴趣匹配得分 > 语言匹配 > 技术栈关联 > 探索推荐；推荐理由标签生成正确 |
| `__tests__/integration/api/recommend.test.ts` | GET /api/recommend?role=fullstack&interests=web-dev,ai-ml&techStack=react,node 返回含 reason 的项目列表 |

#### 绿：最小实现

| 文件 | 说明 |
|------|------|
| `src/lib/recommend.ts` | 重写为 `getRecommendations(context: RecommendContext)` 加权算法 + 推荐理由 |
| `src/app/api/recommend/route.ts` | 接受新参数，返回 `{ project, reason }[]` |
| `src/hooks/useRecommend.ts` | 传递完整画像信息 |

#### 重构

- 提取 `src/lib/recommend/` 目录：`scorer.ts`（评分）、`reason.ts`（理由生成）、`index.ts`（入口）
- 项目 description 关键词提取优化

**交付物**：
- 加权推荐算法
- 推荐理由标签
- 单元 + 集成测试通过

---

## Phase 4：UI 集成

### 4.1 TDD 步骤

#### 红：写测试

| 测试文件 | 描述 |
|----------|------|
| `__tests__/e2e/preferences.spec.ts` | 设置面板显示画像信息；"重新设定兴趣"触发引导 |

#### 绿：最小实现

| 文件 | 说明 |
|------|------|
| `src/components/PreferencesPanel.tsx` | 增加画像编辑区域 + "重新设定兴趣"按钮 |
| `src/components/ProjectCard.tsx` | 增加 `reason` prop，显示推荐理由标签 |
| `src/components/RecommendTab.tsx` | 标题改为"为你精选"，副标题展示匹配逻辑 |
| `src/components/BatchGrid.tsx` | 传递 reason 到 ProjectCard |

#### 重构

- 推荐理由标签样式提取为 `RecommendBadge` 子组件
- 画像编辑区域抽取为独立组件

**交付物**：
- 完整 UI 集成
- 推荐理由可见
- 设置可编辑画像

---

## 测试命令速查

```bash
# 单元测试（监听）
npm run test:unit -- --watch

# 单次运行
npm run test:unit

# E2E（需 dev server）
npm run dev
npm run test:e2e

# E2E UI 调试
npm run test:e2e -- --ui
```

---

## 交付检查清单

| 功能 | Phase | 测试覆盖 |
|------|-------|----------|
| 数据库迁移 + 兴趣常量 | Phase 1 | 单元 + 集成 |
| 偏好 API 扩展（GET/PUT/Init） | Phase 1 | 集成 |
| 首次引导 Wizard（3 步） | Phase 2 | E2E |
| 加权推荐算法 + 推荐理由 | Phase 3 | 单元 + 集成 |
| 推荐理由标签 UI | Phase 4 | E2E |
| 设置面板画像编辑 | Phase 4 | E2E |