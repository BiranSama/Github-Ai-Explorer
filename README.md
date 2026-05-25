<div align="center">

<img src="https://img.shields.io/badge/🔮_GitHub_AI_Explorer-v0.1-8B5CF6?style=for-the-badge" alt="GitHub AI Explorer" />

### **帮中文开发者读懂 GitHub 项目，发现值得关注的技术趋势**

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=8B5CF7&center=true&vCenter=true&width=500&lines=%E4%B8%8D%E6%98%AF%E5%86%B7%E5%88%B0Trending%E9%87%8D%E5%A4%8D%E2%80%94%E2%80%94%E6%98%AF%E4%BD%A0%E7%9A%84AI%E9%A1%B9%E7%9B%AE%E7%BF%BB%E8%AF%91%E5%AE%98+%E6%8E%A2%E5%97%85%E5%99%A8;%E5%91%8A%E8%AF%89%E4%BD%A0%E4%B8%BA%E4%BB%80%E4%B9%88%E8%BF%99%E4%B8%AA%E9%A1%B9%E7%9B%AE%E5%80%BC%E5%BE%97%E5%85%B3%E6%B3%A8)](https://git.io/typing-svg)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🚀 快速开始](#-快速开始) · [✨ 核心功能](#-核心功能) · [📖 使用指南](#-使用指南) · [🤖 AI 配置](#-ai-服务商配置) · [🧪 测试](#-测试)

</div>

---

## 💡 为什么做这个？

三个真实痛点，每个中文开发者都遇到过：

> **🔍 搜不准** — GitHub 搜索要精准英文关键词，中文开发者很难找对项目
> **🤷 看不懂** — 打开一个项目，README 写了 2000 行英文，看完还是不知道干啥的
> **🧭 不知道探索啥** — Trending 一堆项目，哪个跟我有关？哪个值得学？

**GitHub AI Explorer 的回答：不用搜，AI 帮你找；看不懂，AI 帮你翻；不知道看啥，AI 按你的兴趣推荐。**

---

## ✨ 核心功能

### 🧑‍🚀 首次引导 — 30 秒建立你的技术画像

首次打开，3 步搞定 →

| 步骤 | 你做什么 | 效果 |
|------|---------|------|
| 1️⃣ 你是谁 | 选角色：前端 / 后端 / 全栈 / 移动 / DevOps / 数据AI / 学生 | 系统理解你的技术背景 |
| 2️⃣ 感兴趣什么 | 选领域：Web / AI / CLI / 游戏 / 开源贡献... 12 个方向 | 推荐精准匹配你的兴趣 |
| 3️⃣ 在用什么 | 选技术栈：React / Python / Go / Rust... + 自由添加 | 关联推荐你生态内的工具 |

完成后，所有推荐为你量身定制，随时可在设置中重新设定。

### 🔥 探嗅热门 — 不只是 Trending

- 📊 **飙升榜**：按日 / 周 / 月追踪 star 增长最快的项目
- 🎯 **语言筛选**：只看你用的语言
- ⚡ 一眼看出哪个项目正在"起飞"

### 🤖 AI 推荐 — 每个项目都告诉你"为什么"

| 推荐理由 | 标签 | 含义 |
|----------|------|------|
| 🎯 匹配你的 AI 兴趣 | `interest` | 项目描述命中你的兴趣领域 |
| 💻 TypeScript 语言匹配 | `language` | 项目语言在你的技术栈里 |
| 🔗 与你的 React 技术栈相关 | `techstack` | 项目和你正在用的技术有关联 |
| ✨ 探索发现：走出舒适区 | `explore` | 圈外好项目，拓宽视野 |

### 📝 AI 中文解读 — 30 秒看懂一个项目

点开任意项目卡片的详情，AI 自动生成：

- ✅ 这个项目是做什么的
- ✅ 它的主要特点或优势
- ✅ 适合什么场景 / 什么类型的开发者

**兼容所有 OpenAI-compatible 服务商**：一行配置切换 DeepSeek / OpenAI / Silicon Flow / 本地 Ollama。

### 🌐 项目关系图谱

可视化项目之间的技术关联，发现隐藏的连接。

### 🔔 Web Push 通知

新趋势项目到达时推送浏览器通知，不错过任何值得关注的新星。

---

## 🖥️ 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | [Next.js 15](https://nextjs.org/) (App Router) | React Server Components + API Routes |
| 前端 | React 19 + TypeScript + Tailwind CSS 4 | 类型安全 + 现代样式 |
| 动画 | Framer Motion + Canvas 2D | 流光边框 + 粒子背景 |
| 数据库 | Prisma ORM + SQLite | 零配置本地存储 |
| AI | OpenAI SDK | 通过 `baseURL` 兼容所有服务商 |
| 测试 | Vitest + Playwright | TDD 全覆盖 |
| 定时 | node-cron | 应用内定时任务 |

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   浏览器 (Next.js 前端)                   │
│   Trending · Search · Recommend · Graph · Onboarding    │
├─────────────────────────────────────────────────────────┤
│                 Next.js Route Handlers                   │
│   /api/trending · /api/recommend · /api/projects/[id]   │
│   /api/preferences · /api/search · /api/push            │
├─────────────────────────────────────────────────────────┤
│                      业务逻辑层                           │
│   trending.ts · recommend.ts · github.ts · llm.ts       │
│   interests.ts · cron.ts · webpush.ts                   │
├─────────────────────────────────────────────────────────┤
│                      数据层                              │
│   Prisma ORM ←→ SQLite             ←→  GitHub Search API│
│                                       ↕                  │
│                                  LLM API (OpenAI-compat) │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 目录结构

```
github-ai-explorer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Route Handlers
│   │   │   ├── trending/       #   热门项目抓取与展示
│   │   │   ├── recommend/      #   智能推荐（含推荐理由）
│   │   │   ├── preferences/     #   用户偏好 + 首次引导初始化
│   │   │   ├── projects/[id]/  #   项目详情 + AI 摘要
│   │   │   ├── search/         #   项目搜索
│   │   │   ├── push/           #   Web Push 订阅/发送
│   │   │   └── graph/          #   项目关系图谱
│   │   ├── page.tsx            # 首页（含 Onboarding 判断）
│   │   └── layout.tsx          # 根布局
│   ├── components/             # React 组件
│   │   ├── OnboardingWizard.tsx#   首次引导主组件
│   │   ├── StepRole.tsx        #   步骤1：角色选择
│   │   ├── StepInterests.tsx  #   步骤2：兴趣选择
│   │   ├── StepTechStack.tsx  #   步骤3：技术栈选择
│   │   ├── ProjectCard.tsx    #   项目卡片（含推荐理由标签）
│   │   ├── ProjectDrawer.tsx   #   项目详情抽屉
│   │   ├── PreferencesPanel.tsx#   偏好设置（含兴趣画像编辑）
│   │   └── ...                 #   其他 UI 组件
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/                    # 工具库
│   │   ├── db.ts              #   Prisma Client
│   │   ├── github.ts           #   GitHub API
│   │   ├── llm.ts             #   LLM 通用客户端
│   │   ├── recommend.ts        #   加权推荐算法
│   │   ├── interests.ts        #   兴趣画像常量 + 关键词映射
│   │   ├── profile.ts          #   画像校验
│   │   └── ...
│   └── __tests__/              # 测试（unit / integration / e2e）
├── prisma/
│   └── schema.prisma           # 数据模型
├── public/sw.js                 # Service Worker
└── .env.example                 # 环境变量模板
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/BiranSama/Github-Ai-Explorer.git
cd github-ai-explorer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

#### 方式 A：交互式脚本（推荐 ✨）

**Windows PowerShell：**
```powershell
.\setup-llm.ps1
```

**Windows CMD：**
```cmd
setup-llm.bat
```

脚本会引导你完成 7 步配置：
1. 🔄 选择 LLM 服务商（OpenAI / Anthropic / DeepSeek 等）
2. 🔑 输入 API Base URL 和 Key
3. 🔍 **自动检测**可用模型列表
4. 📝 选择模型或手动输入
5. ✅ **验证** API Key 可用性
6. 🔔 配置 Web Push VAPID 密钥
7. 📄 自动生成 `.env` 文件

#### 方式 B：手动配置

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# GitHub Token（https://github.com/settings/tokens 获取）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# AI 服务商（示例为 DeepSeek，可替换为任何 OpenAI-compatible 服务商）
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=deepseek-chat

# Web Push（npx web-push generate-vapid-keys 生成）
VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_EMAIL=mailto:your@email.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. 启动 🎉

```bash
npm run dev
```

打开 **http://localhost:3000** → 首次引导自动弹出！

---

## 📖 使用指南

### 首次使用

1. 打开 `http://localhost:3000`
2. 按引导选择你的 **角色 → 兴趣领域 → 技术栈**
3. 完成后自动跳转主页，推荐已为你定制

### 探嗅热门项目

- 切换到 **热门** Tab 浏览当前热门项目
- 使用左侧面板按 **语言筛选** 或切换 **日/周/月** 时间范围
- 点击项目卡片查看 AI 中文解读

### AI 精选推荐

- 切换到 **精选** Tab 查看基于你画像的推荐
- 每个项目附有推荐理由标签：🎯兴趣 / 💻语言 / 🔗技术栈 / ✨探索
- 点击 **换一批** 获取新推荐

### 修改兴趣画像

- 点击设置图标打开 **偏好设置**
- 查看当前兴趣画像，点击 **重新设定** 重新引导

### 重置引导

如需重新触发首次引导，打开 Prisma Studio：

```bash
npx prisma studio
```

找到 `UserPreference` 表，将 `onboardingCompleted` 改为 `false`，刷新页面即可。

---

## 🤖 AI 服务商配置

**一行配置，切换任意服务商** — 只改 `LLM_BASE_URL` + `LLM_MODEL`：

| 服务商 | `LLM_BASE_URL` | `LLM_MODEL` | 月成本 |
|--------|---------------|-------------|--------|
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` | ¥1 起 |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | ~$0.15/百万token |
| Silicon Flow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` | 有免费额度 |
| 本地 Ollama | `http://localhost:11434/v1` | `llama3` | 免费 |
| 任何兼容的 | 对应地址 | 对应模型名 | — |

---

## 🧪 测试

本项目采用 **TDD（测试驱动开发）**：

```bash
# 单元测试 + 集成测试
npm run test:unit

# 监听模式（开发时使用）
npm run test:unit -- --watch

# E2E 测试（需先启动 dev server）
npm run dev          # 终端 1
npm run test:e2e     # 终端 2
```

---

## 🔒 隐私

- **单用户应用**，无需登录，所有数据存在本地 SQLite
- GitHub Token 仅用于调用 GitHub Search API
- Web Push 订阅信息不上传第三方
- AI 调用仅在点击"生成解读"时触发，不会自动发送数据

---

## 🛣️ 路线图

- [ ] 中文自然语言搜索（"帮我找一个 React 文件上传组件"）
- [ ] 项目 README 双语对照
- [ ] 技术概念卡片（hover "monorepo" 显示中文解释）
- [ ] 学习路径推荐（"先看这个，再看那个"）
- [ ] 飙升原因分析（AI 分析为什么最近火了）

---

## 📄 License

MIT License

---

<div align="center">

**Made with ❤️ for Chinese Developers**

⭐ 如果觉得有用，给个 Star！

</div>