# GitHub AI Explorer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Framer%20Motion-12-EF0091?logo=framer" />
</p>

一个为中文开发者打造的 **GitHub 热门项目探索工具**，自动抓取 GitHub 趋势项目，用 AI 生成中文摘要，并根据你的技术偏好进行智能推荐。

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🔥 **热门榜单** | 自动抓取 GitHub 高星项目，支持按语言筛选 |
| 🔍 **探索发现** | 搜索任意 GitHub 项目，一键查看 AI 摘要 |
| 🤖 **AI 推荐** | 根据你的偏好语言，智能推荐匹配项目 |
| 📝 **AI 中文摘要** | 每个项目自动生成技术亮点中文总结 |
| 🔔 **Web Push 通知** | 新趋势项目到达时推送浏览器通知 |
| 🌗 **双主题** | 支持浅色/深色模式，自适应系统偏好 |
| ✨ **动态 UI** | 流光边框、粒子背景、动画卡片等视觉效果 |

## 🖥️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **前端**: React 19 + TypeScript + Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/) + Canvas 2D
- **数据库**: Prisma ORM + SQLite
- **AI**: OpenAI SDK（兼容 DeepSeek / OpenAI / 任何 OpenAI-compatible 服务商）
- **测试**: Vitest（单元/集成）+ Playwright（E2E）
- **定时任务**: node-cron

## 📁 项目结构

```
github-ai-explorer/
├── src/
│   ├── app/                 # Next.js App Router（页面 + API Routes）
│   │   ├── api/
│   │   │   ├── trending/        # 获取热门项目
│   │   │   ├── search/          # 搜索项目
│   │   │   ├── recommend/       # 智能推荐
│   │   │   ├── projects/[id]/   # 项目详情 + AI 摘要
│   │   │   ├── preferences/     # 用户偏好设置
│   │   │   ├── push/            # Web Push 订阅/发送
│   │   │   └── cron/start/      # 定时任务触发
│   │   ├── page.tsx             # 首页（热门/搜索/推荐三 Tab）
│   │   ├── layout.tsx           # 根布局
│   │   └── globals.css          # 全局样式 + 主题变量
│   ├── components/          # React 组件
│   │   ├── NavBar.tsx           # 顶部导航 + Tab 切换
│   │   ├── HeroSection.tsx      # 首屏 Hero
│   │   ├── TrendingTab.tsx      # 热门榜单 Tab
│   │   ├── SearchTab.tsx        # 搜索 Tab
│   │   ├── RecommendTab.tsx     # AI 推荐 Tab
│   │   ├── ProjectCard.tsx      # 项目卡片
│   │   ├── BatchGrid.tsx        # 推荐网格布局
│   │   ├── ProjectDrawer.tsx    # 项目详情抽屉
│   │   ├── ElectricBorder.tsx   # 流光边框效果
│   │   ├── DynamicBackground.tsx# 动态粒子背景
│   │   ├── GhostCursor.tsx      # 幽灵光标跟随
│   │   └── TechStackFooter.tsx  # 底部 Logo 轮播
│   ├── hooks/               # 自定义 Hooks
│   └── lib/                 # 工具库（db, github, llm, cron, recommend...）
├── prisma/
│   └── schema.prisma        # 数据模型（Project / UserPreference / PushLog）
├── public/
│   └── sw.js                # Service Worker（Web Push）
├── .env.example             # 环境变量模板
├── .gitignore               # Git 忽略规则
├── next.config.js           # Next.js 配置
├── tailwind.config.ts       # Tailwind 配置
├── vitest.config.ts         # Vitest 测试配置
├── playwright.config.ts     # Playwright E2E 配置
└── package.json
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/github-ai-explorer.git
cd github-ai-explorer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的密钥：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# GitHub API Token（用于抓取项目信息）
# 获取方式：https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# AI 服务商配置（兼容任何 OpenAI-compatible API）
# 示例：DeepSeek
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=deepseek-chat

# Web Push VAPID 密钥（用于浏览器推送通知）
# 生成方式：npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_EMAIL=mailto:your@email.com

# 应用地址
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 即可使用。

## 🧪 测试

本项目采用 **TDD（测试驱动开发）**，所有功能均有测试覆盖。

```bash
# 单元测试 + 集成测试
npm run test:unit

# E2E 测试（需先启动 dev server）
npm run dev    # 终端1
npm run test:e2e   # 终端2
```

## 🐳 AI 服务商兼容性

本项目只使用 **OpenAI SDK** 的 `baseURL` 参数切换服务商，无需引入多个 SDK：

| 服务商 | `LLM_BASE_URL` | `LLM_MODEL` |
|--------|---------------|-------------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Silicon Flow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| 本地 Ollama | `http://localhost:11434/v1` | `llama3` |
| 任何 OpenAI-compatible | 对应地址 | 对应模型名 |

## 📸 界面预览

| 热门榜单 | AI 推荐 | 项目详情 |
|---------|---------|---------|
| 动态粒子背景 + 流光卡片 | 网格布局 + 换一批动画 | 右侧滑出抽屉 + AI 摘要 |

## 🔒 隐私说明

- 本项目为**单用户应用**，无需登录，所有数据存储在本地 SQLite 数据库
- GitHub Token 仅用于调用 GitHub Search API，不会泄露
- Web Push 订阅信息存储在本地，不会上传至第三方

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ for Chinese Developers
</p>
