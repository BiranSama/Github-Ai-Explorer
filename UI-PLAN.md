# GitHub AI Explorer — UI 改造计划

**日期：** 2026/05/10  
**目标：** 从基础工具 UI 升级为科技感视觉体验  
**模式：** 双主题（暗色 + 亮色）、视觉优先、组件驱动

---

## 设计决策

| 决策项 | 方案 |
|--------|------|
| 主题 | 暗色 + 亮色双主题，用户可切换 |
| 性能策略 | 视觉优先，特效全开 |
| 首页结构 | 小 Hero（~30vh）+ Tab 内容区 + Footer |
| Hero 特效 | GhostCursor（限定 Hero 区域内）|
| Tab 指示器 | ElectricBorder 电光线，切换时平滑滑动 |
| 项目卡片 | Hover 时电光边框生长 + 语言标签渐变色 |
| 推荐 Tab | ScrollStack 堆叠卡片 + "换一批"Framer Motion 切换 |
| 动态背景 | Subtle mesh gradient + 噪点纹理 |
| Footer | LogoLoop 技术栈无限轮播 |

---

## Phase 执行顺序

### Phase 1: 主题系统
- 重写 `globals.css`：完整的亮/暗 CSS 变量
- 安装 `framer-motion`
- 创建 `ThemeToggle` 组件（Switch 切换暗/亮）
- 接入 `layout.tsx` 的 html class
- 暗色下 primary 为亮紫 `#a855f7`，亮色下为靛蓝 `#6366f1`

### Phase 2: 动态背景
- 创建 `DynamicBackground` 组件
- Mesh gradient：缓慢移动的彩色 blob（CSS animation）
- 噪点纹理：极淡的 SVG noise overlay
- 背景始终在最底层，不影响可读性

### Phase 3: Hero 区域 + GhostCursor
- 安装 `three` + `@types/three`
- 创建 `HeroSection` 组件
- 标题："GitHub AI Explorer" + 副标题
- GhostCursor 限定在 Hero 区域内
- 暗色：亮紫光晕 / 亮色：靛蓝光晕
- Hero 下方自然过渡到 Tab 栏

### Phase 4: Tab 栏 + ElectricBorder 指示器
- 重构 `NavBar`：Tab 按钮下方加电光线
- 创建 `ElectricTabIndicator` 组件
- 使用 Framer Motion `layoutId` 实现切换时电光线平滑滑动
- 暗色：发光紫 / 亮色：扰动靛蓝线条

### Phase 5: 项目卡片升级
- 重构 `ProjectCard`
- 默认状态：subtle 阴影 + 圆角 + 毛玻璃背景（暗色）
- Hover：ElectricBorder 从四边生长（0.3s）
- 语言标签：每种语言固定渐变色（TS=蓝、Python=黄、Rust=橙...）
- Stars/Forks 数字加动画计数

### Phase 6: ProjectDrawer 升级
- 重构 `ProjectDrawer`
- 容器包裹 ElectricBorder
- 入场动画：从右侧滑入 + 遮罩 fade + 内容 stagger
- AI 说明区域加 typing 动画效果

### Phase 7: 推荐 Tab → ScrollStack 堆叠
- 安装 `lenis`
- 创建 `StackCard` 组件
- 3 张卡片堆叠显示（最前完整，后两张露角）
- "换一批"：Framer Motion AnimatePresence 切换
- 可选：Lenis 平滑滚动堆叠效果

### Phase 8: Footer LogoLoop
- 安装 `react-icons`
- 创建 `TechStackFooter` 组件
- LogoLoop 无限横向滚动
- 技术栈：TypeScript / Next.js / Tailwind / Prisma / SQLite / OpenAI / DeepSeek
- Hover 减速，点击跳转

### Phase 9: 微调与测试
- 双主题色值微调
- 低端设备性能检查
- 减少动画偏好（prefers-reduced-motion）适配

---

## 新增依赖

```bash
npm install framer-motion lenis three react-icons
npm install -D @types/three
npx shadcn add switch separator skeleton
```

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `globals.css` | 重写 | 完整双主题 CSS 变量 |
| `tailwind.config.ts` | 修改 | 扩展动画、颜色 |
| `layout.tsx` | 修改 | 接入 ThemeToggle + DynamicBackground |
| `page.tsx` | 修改 | 加入 HeroSection + TechStackFooter |
| `NavBar.tsx` | 重写 | Tab + ElectricTabIndicator |
| `ProjectCard.tsx` | 重写 | 新卡片 + hover 电光 |
| `ProjectDrawer.tsx` | 重写 | ElectricBorder + 入场动画 |
| `RecommendTab.tsx` | 重写 | StackCard 堆叠 |
| `ThemeToggle.tsx` | 新建 | 主题切换开关 |
| `DynamicBackground.tsx` | 新建 | 动态背景 |
| `HeroSection.tsx` | 新建 | Hero + GhostCursor |
| `ElectricTabIndicator.tsx` | 新建 | Tab 电光线 |
| `StackCard.tsx` | 新建 | 堆叠卡片 |
| `TechStackFooter.tsx` | 新建 | LogoLoop 轮播 |
| `ElectricBorder.tsx` | 新建 | 电光边框组件 |
| `GhostCursor.tsx` | 新建 | 幽灵光标组件 |
| `LogoLoop.tsx` | 新建 | Logo 轮播组件 |

---

## 参考组件来源

- ElectricBorder / GhostCursor / ScrollStack / LogoLoop：开源社区组件（用户提供的参考代码）
- 适配方案：根据本项目数据结构、主题系统、Next.js App Router 进行重构集成

---

## 验收标准

- [ ] 暗色/亮色切换正常，无闪烁
- [ ] Hero 区域 GhostCursor 鼠标跟踪正常
- [ ] Tab 切换电光线滑动平滑
- [ ] 卡片 hover 电光边框生长动画正常
- [ ] 推荐 Tab 堆叠卡片切换动画正常
- [ ] Footer LogoLoop 无限滚动正常
- [ ] `npm run build` 通过
- [ ]  prefers-reduced-motion 下动画自动禁用
