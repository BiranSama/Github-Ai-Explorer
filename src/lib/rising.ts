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