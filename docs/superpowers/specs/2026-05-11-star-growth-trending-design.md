# Star 增长热榜设计

## 概述

为 GitHub AI Explorer 添加"飙升榜"功能，帮助用户发现最近 star 增长最快的项目。支持三个时间维度：今日、本周、本月。

## 背景

当前系统按总 star 数排序，无法发现"正在快速崛起的新项目"。用户需要一个维度来追踪项目的增长势头，而不仅仅是存量热度。

## 目标

1. 发现新星项目 — 帮助用户找到正在快速崛起的项目，用于学习和灵感
2. 追踪关注项目 — 监控已入库项目的增长情况
3. 趋势预测 — 结合增长趋势预测项目未来热度

## 数据模型

### 新增 StarGrowthLog 表

```prisma
model StarGrowthLog {
  id        Int      @id @default(autoincrement())
  projectId String
  date      DateTime // 仅日期，UTC 00:00
  stars     Int      // 当天记录的 total stars

  project Project @relation(fields: [projectId], references: [id])

  @@unique([projectId, date])
  @@map("star_growth_logs")
}
```

### 扩展 Project 表

```prisma
model Project {
  // ... existing fields
  starsYesterday   Int?      // 昨日 star 总数（缓存）
  lastGrowthUpdate DateTime? // 上次增长计算时间
}
```

### 增长计算公式

- `dailyGrowth` = 当天 `stars` - `starsYesterday`
- `weeklyGrowth` = 当天 `stars` - 7天前 `stars`（查 StarGrowthLog）
- `monthlyGrowth` = 当天 `stars` - 30天前 `stars`（查 StarGrowthLog）

### 基线策略

首次记录时把当前 star 数作为第一天基数（`starsYesterday = stars`），之后每日更新。

## API 设计

### GET /api/rising

**Query Parameters**:
- `period`: `daily` | `weekly` | `monthly`（默认 `weekly`）
- `limit`: number（默认 20）
- `language?`: string（可选，按语言筛选）

**Response**:
```typescript
{
  "items": [
    {
      "project": { /* 完整 Project 对象 */ },
      "growth": {
        "daily": 120,
        "weekly": 850,
        "monthly": 2300
      }
    }
  ],
  "period": "weekly"
}
```

**排序逻辑**：按对应 `period` 的增长值降序。

## 定时任务

### syncStarGrowth

每日 UTC 00:00 执行：

1. 遍历所有 `Project`
2. 查 `StarGrowthLog` 获取最近 30 天快照（如有）
3. 写入今日快照：`{ projectId, date: today, stars }`
4. 更新 `Project.starsYesterday = Project.stars`
5. 更新 `Project.lastGrowthUpdate = now()`

## 前端

### 新增 RisingTab 组件

- 独立 Tab（与 Trending/Search/Recommend 平级）
- 时间维度切换：今日 / 本周 / 本月（默认本周）
- 卡片显示：项目名 + 增长 badge（+120 今日）
- 排序：按选中维度的增长值降序

### 新增 useRising Hook

```typescript
// src/hooks/useRising.ts
function useRising(period: 'daily' | 'weekly' | 'monthly')
```

## 实现计划

### Phase 1: 数据库 & 定时任务
1. 添加 Prisma migration（StarGrowthLog 表 + Project 扩展字段）
2. 实现 `syncStarGrowth` cron 函数
3. 每日 UTC 00:00 调度

### Phase 2: API
1. 新增 `GET /api/rising` 路由
2. 增长计算逻辑

### Phase 3: 前端
1. 新增 `RisingTab` 组件
2. 新增 `useRising` hook
3. 集成到 NavBar Tab 导航

## 风险 & 限制

- 全量快照在项目数量多时 cron 执行时间较长
- 首次上线时无历史基线，首日显示"0 增长"，次日才有数据
