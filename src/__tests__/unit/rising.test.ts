import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../lib/db'

describe('StarGrowthLog Model', () => {
  const testProjectId = 'test-project-star-growth-' + Date.now()

  beforeAll(async () => {
    await prisma.project.create({
      data: {
        id: testProjectId,
        name: 'Test Project',
        fullName: 'test/' + testProjectId,
        owner: 'test',
        lastPushed: new Date(),
        trendingDate: new Date(),
        fetchedAt: new Date(),
      },
    })
  })

  afterAll(async () => {
    await prisma.starGrowthLog.deleteMany({ where: { projectId: testProjectId } })
    await prisma.project.delete({ where: { id: testProjectId } })
  })

  it('should create a StarGrowthLog entry', async () => {
    const log = await prisma.starGrowthLog.create({
      data: {
        projectId: testProjectId,
        date: new Date('2026-05-10'),
        stars: 100,
      },
    })
    expect(log.id).toBeDefined()
    expect(log.projectId).toBe(testProjectId)
    expect(log.stars).toBe(100)
  })

  it('should query StarGrowthLog by projectId', async () => {
    const logs = await prisma.starGrowthLog.findMany({
      where: { projectId: testProjectId },
    })
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0].projectId).toBe(testProjectId)
  })

  it('should enforce unique constraint on projectId and date', async () => {
    await expect(
      prisma.starGrowthLog.create({
        data: {
          projectId: testProjectId,
          date: new Date('2026-05-10'),
          stars: 150,
        },
      })
    ).rejects.toThrow()
  })

  it('should allow multiple logs for same project on different dates', async () => {
    const log = await prisma.starGrowthLog.create({
      data: {
        projectId: testProjectId,
        date: new Date('2026-05-11'),
        stars: 120,
      },
    })
    expect(log.id).toBeDefined()
  })
})