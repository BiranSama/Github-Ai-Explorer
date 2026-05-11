# Star Growth Trending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Rising" tab showing GitHub projects with fastest star growth (daily/weekly/monthly), discoverable via dedicated API, cron job, and frontend tab.

**Architecture:** Store daily star snapshots in `StarGrowthLog` table. Compute growth as delta between current stars and historical snapshots. Cron job at UTC 00:00 syncs all projects. API returns projects with precomputed growth values. Frontend shows RisingTab with period filter.

**Tech Stack:** Prisma/SQLite, node-cron, Next.js App Router, React hooks

---

## File Map

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` |
| Create | `src/lib/rising.ts` |
| Create | `src/app/api/rising/route.ts` |
| Create | `src/hooks/useRising.ts` |
| Create | `src/components/RisingTab.tsx` |
| Modify | `src/components/NavBar.tsx` |
| Modify | `src/lib/cron.ts` |
| Create | `src/__tests__/unit/rising.test.ts` |
| Create | `src/__tests__/integration/api/rising.test.ts` |

---

## Phase 1: Database

### Task 1: Prisma Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `src/__tests__/unit/rising.test.ts`

- [ ] **Step 1: Add StarGrowthLog model to schema**

```prisma
model StarGrowthLog {
  id        Int      @id @default(autoincrement())
  projectId String
  date      DateTime
  stars     Int

  project Project @relation(fields: [projectId], references: [id])

  @@unique([projectId, date])
  @@map("star_growth_logs")
}
```

- [ ] **Step 2: Add starsYesterday and lastGrowthUpdate to Project model**

```prisma
model Project {
  // ... existing fields (after openIssues)
  starsYesterday    Int?       @default(0)
  lastGrowthUpdate  DateTime?
}
```

- [ ] **Step 3: Run migration**

Run: `npx prisma migrate dev --name add_star_growth`
Expected: Migration created successfully

- [ ] **Step 4: Write unit test for StarGrowthLog model**

```typescript
// src/__tests__/unit/rising.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'

describe('StarGrowthLog', () => {
  beforeEach(async () => {
    await prisma.starGrowthLog.deleteMany()
    await prisma.project.deleteMany()
  })

  it('should create star growth log entry', async () => {
    const project = await prisma.project.create({
      data: { id: 'test/repo', name: 'repo', fullName: 'test/repo', owner: 'test', stars: 100, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })
    const log = await prisma.starGrowthLog.create({
      data: { projectId: project.id, date: new Date('2026-05-01'), stars: 100 }
    })
    expect(log.stars).toBe(100)
  })

  it('should enforce unique constraint on projectId+date', async () => {
    const project = await prisma.project.create({
      data: { id: 'test/repo2', name: 'repo2', fullName: 'test/repo2', owner: 'test', stars: 100, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })
    const date = new Date('2026-05-01')
    await prisma.starGrowthLog.create({ data: { projectId: project.id, date, stars: 100 } })
    await expect(prisma.starGrowthLog.create({ data: { projectId: project.id, date, stars: 101 } })).rejects.toThrow()
  })
})
```

- [ ] **Step 5: Run test**

Run: `npm run test:unit -- src/__tests__/unit/rising.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/__tests__/unit/rising.test.ts
git commit -m "feat: add StarGrowthLog model and Project starsYesterday field"
```

---

## Phase 2: Sync Logic

### Task 2: syncStarGrowth Cron Function

**Files:**
- Create: `src/lib/rising.ts`
- Modify: `src/lib/cron.ts`
- Test: `src/__tests__/unit/rising.test.ts`

- [ ] **Step 1: Write syncStarGrowth function**

```typescript
// src/lib/rising.ts
import { prisma } from './db'

export async function syncStarGrowth() {
  const projects = await prisma.project.findMany()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  for (const project of projects) {
    await prisma.starGrowthLog.upsert({
      where: { projectId_date: { projectId: project.id, date: today } },
      create: { projectId: project.id, date: today, stars: project.stars },
      update: { stars: project.stars },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: {
        starsYesterday: project.stars,
        lastGrowthUpdate: new Date(),
      },
    })
  }
}

export async function getGrowth(projectId: string, currentStars: number): Promise<{ daily: number; weekly: number; monthly: number }> {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const getSnapshot = (daysAgo: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - daysAgo)
    return prisma.starGrowthLog.findUnique({
      where: { projectId_date: { projectId, date: d } },
    })
  }

  const [yesterday, weekAgo, monthAgo] = await Promise.all([
    getSnapshot(1),
    getSnapshot(7),
    getSnapshot(30),
  ])

  return {
    daily: yesterday ? currentStars - yesterday.stars : 0,
    weekly: weekAgo ? currentStars - weekAgo.stars : 0,
    monthly: monthAgo ? currentStars - monthAgo.stars : 0,
  }
}
```

- [ ] **Step 2: Add UTC 00:00 cron schedule to start() in cron.ts**

```typescript
// src/lib/cron.ts — add import and new cron job
import { syncStarGrowth } from './rising'

export function start() {
  if (job) return
  // Push job: every 30 min
  job = cron.schedule('*/30 * * * *', async () => {
    try {
      await runPush()
    } catch (e) {
      console.error('[cron] push error:', e)
    }
  })

  // Star growth sync: daily at UTC 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
      await syncStarGrowth()
      console.log('[cron] star growth synced')
    } catch (e) {
      console.error('[cron] star growth sync error:', e)
    }
  })

  console.log('[cron] started')
}
```

- [ ] **Step 3: Write unit tests for syncStarGrowth**

```typescript
// Append to src/__tests__/unit/rising.test.ts
describe('syncStarGrowth', () => {
  it('should upsert today snapshot and update starsYesterday', async () => {
    const project = await prisma.project.create({
      data: { id: 'test/sync', name: 'sync', fullName: 'test/sync', owner: 'test', stars: 500, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })

    await syncStarGrowth()

    const updated = await prisma.project.findUnique({ where: { id: project.id } })
    expect(updated?.starsYesterday).toBe(500)

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const log = await prisma.starGrowthLog.findUnique({
      where: { projectId_date: { projectId: project.id, date: today } }
    })
    expect(log?.stars).toBe(500)
  })
})

describe('getGrowth', () => {
  it('should calculate daily/weekly/monthly growth', async () => {
    const project = await prisma.project.create({
      data: { id: 'test/growth', name: 'growth', fullName: 'test/growth', owner: 'test', stars: 1000, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    await prisma.starGrowthLog.createMany({
      data: [
        { projectId: project.id, date: new Date(today.getTime() - 1 * 86400000), stars: 950 },
        { projectId: project.id, date: new Date(today.getTime() - 7 * 86400000), stars: 700 },
        { projectId: project.id, date: new Date(today.getTime() - 30 * 86400000), stars: 300 },
      ]
    })

    const growth = await getGrowth(project.id, 1000)
    expect(growth.daily).toBe(50)
    expect(growth.weekly).toBe(300)
    expect(growth.monthly).toBe(700)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit -- src/__tests__/unit/rising.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/rising.ts src/lib/cron.ts src/__tests__/unit/rising.test.ts
git commit -m "feat: add syncStarGrowth cron and getGrowth calculation"
```

---

## Phase 3: API

### Task 3: GET /api/rising

**Files:**
- Create: `src/app/api/rising/route.ts`
- Test: `src/__tests__/integration/api/rising.test.ts`

- [ ] **Step 1: Write /api/rising route**

```typescript
// src/app/api/rising/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getGrowth } from '@/lib/rising'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'weekly') as 'daily' | 'weekly' | 'monthly'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const language = searchParams.get('language') || undefined

  const where: Record<string, unknown> = {}
  if (language) where.primaryLanguage = language

  const projects = await prisma.project.findMany({
    where,
    take: 100,
    orderBy: { stars: 'desc' },
  })

  const withGrowth = await Promise.all(
    projects.map(async (p) => {
      const growth = await getGrowth(p.id, p.stars)
      return { project: p, growth }
    })
  )

  const sorted = withGrowth.sort((a, b) => b.growth[period] - a.growth[period])

  return NextResponse.json({
    items: sorted.slice(0, limit),
    period,
  })
}
```

- [ ] **Step 2: Write integration test**

```typescript
// src/__tests__/integration/api/rising.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/db'
import { syncStarGrowth } from '@/lib/rising'

describe('GET /api/rising', () => {
  beforeEach(async () => {
    await prisma.starGrowthLog.deleteMany()
    await prisma.project.deleteMany()
    await syncStarGrowth()
  })

  it('should return projects sorted by weekly growth', async () => {
    const p1 = await prisma.project.create({
      data: { id: 'p1', name: 'p1', fullName: 'p1', owner: 'o', stars: 1000, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })
    const p2 = await prisma.project.create({
      data: { id: 'p2', name: 'p2', fullName: 'p2', owner: 'o', stars: 1000, lastPushed: new Date(), fetchedAt: new Date(), trendingDate: new Date() }
    })

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    await prisma.starGrowthLog.createMany({
      data: [
        { projectId: p1.id, date: new Date(today.getTime() - 7 * 86400000), stars: 100 },
        { projectId: p2.id, date: new Date(today.getTime() - 7 * 86400000), stars: 500 },
      ]
    })

    const res = await fetch('http://localhost:3000/api/rising?period=weekly&limit=10')
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.items[0].project.id).toBe(p1.id)
    expect(json.items[0].growth.weekly).toBe(900)
    expect(json.period).toBe('weekly')
  })
})
```

- [ ] **Step 3: Run integration test**

Run: `npm run test:unit -- src/__tests__/integration/api/rising.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/rising/route.ts src/__tests__/integration/api/rising.test.ts
git commit -m "feat: add GET /api/rising endpoint"
```

---

## Phase 4: Frontend

### Task 4: useRising Hook

**Files:**
- Create: `src/hooks/useRising.ts`

- [ ] **Step 1: Write useRising hook**

```typescript
// src/hooks/useRising.ts
'use client'
import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'
import type { Project } from '@prisma/client'

export interface RisingProject {
  project: Project
  growth: {
    daily: number
    weekly: number
    monthly: number
  }
}

export function useRising(period: 'daily' | 'weekly' | 'monthly' = 'weekly', limit = 20) {
  const [items, setItems] = useState<RisingProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetch_() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ period, limit: String(limit) })
      const data = await apiGet<{ items: RisingProject[]; period: string }>(`/api/rising?${params}`)
      setItems(data.items)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [period, limit])

  return { items, loading, error, refetch: fetch_ }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRising.ts
git commit -m "feat: add useRising hook"
```

---

### Task 5: RisingTab Component

**Files:**
- Create: `src/components/RisingTab.tsx`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/NavBar.tsx`

- [ ] **Step 1: Write RisingTab**

```typescript
// src/components/RisingTab.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRising } from '@/hooks/useRising'
import ProjectCard from './ProjectCard'
import ProjectDrawer from './ProjectDrawer'
import LanguageFilter from './LanguageFilter'

export default function RisingTab() {
  const [lang, setLang] = useState<string | undefined>()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const { items, loading, error, refetch } = useRising(period)

  const filtered = lang
    ? items.filter(i => i.project.primaryLanguage === lang)
    : items

  return (
    <>
      <div className="flex gap-6">
        <aside className="w-44 shrink-0 space-y-6">
          <div className="glass rounded-xl p-4 space-y-4">
            <LanguageFilter value={lang} onChange={setLang} />
            <div className="space-y-2">
              <p className="text-sm font-medium px-1 text-muted-foreground">时间范围</p>
              {(['daily', 'weekly', 'monthly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    period === p
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {p === 'daily' ? '🔥 今日' : p === 'weekly' ? '📅 本周' : '📊 本月'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新榜单
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-3"
              />
              加载中...
            </div>
          )}

          {error && <div className="text-red-500 py-4">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p>暂无增长数据，请稍后再试</p>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard
                  project={item.project}
                  onClick={() => setDrawerId(item.project.id)}
                  growth={item.growth}
                  period={period}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ProjectDrawer projectId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  )
}
```

- [ ] **Step 2: Update ProjectCard Props**

```typescript
// src/components/ProjectCard.tsx — update Props interface
interface Props {
  project: Project
  onClick?: () => void
  growth?: { daily: number; weekly: number; monthly: number }
  period?: 'daily' | 'weekly' | 'monthly'
}
```

Add after the stars display in the card:

```typescript
{growth && period && (
  <span className="flex items-center gap-1 text-green-500 font-medium">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
    +{growth[period].toLocaleString()}
  </span>
)}
```

- [ ] **Step 3: Add RisingTab to NavBar**

Read `src/components/NavBar.tsx` and add `{ id: 'rising', label: '🚀 飙升榜' }` to the tabs array, import RisingTab, and add case 'rising': return <RisingTab />

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/components/RisingTab.tsx src/components/ProjectCard.tsx src/components/NavBar.tsx
git commit -m "feat: add RisingTab component with growth badges"
```

---

## Plan Review Checklist

- [ ] Spec coverage: All sections in design doc have corresponding tasks
- [ ] Placeholder scan: No "TBD", "TODO", or vague steps
- [ ] Type consistency: `getGrowth` returns `{ daily, weekly, monthly }` — matches API usage in `useRising`
- [ ] No gaps between tasks
