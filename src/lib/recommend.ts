import { prisma } from './db'

export interface RecommendOptions {
  preferredLanguages?: string[]
  limit?: number
  excludeProjectIds?: string[]
}

export async function getRecommendations(opts: RecommendOptions = {}) {
  const { preferredLanguages = [], limit = 10, excludeProjectIds = [] } = opts

  const projects = await prisma.project.findMany({
    where: {
      id: { notIn: excludeProjectIds },
      ...(preferredLanguages.length > 0
        ? { primaryLanguage: { in: preferredLanguages } }
        : {}),
    },
    orderBy: { stars: 'desc' },
    take: 100,
  })

  if (projects.length === 0) return []

  // Weighted random: stars越高选中概率越大
  const picked: typeof projects = []
  const remaining = [...projects]

  while (picked.length < limit && remaining.length > 0) {
    const totalStars = remaining.reduce((sum, p) => sum + Math.max(p.stars, 1), 0)
    let r = Math.random() * totalStars
    for (let i = 0; i < remaining.length; i++) {
      r -= Math.max(remaining[i].stars, 1)
      if (r <= 0) {
        picked.push(remaining.splice(i, 1)[0])
        break
      }
    }
    if (r > 0 && remaining.length > 0 && picked.length < limit) {
      picked.push(remaining.pop()!)
    }
  }

  // 混入1-2个非偏好语言但趋势极高的项目（探索推荐）
  if (preferredLanguages.length > 0) {
    const explore = await prisma.project.findMany({
      where: {
        id: { notIn: [...excludeProjectIds, ...picked.map(p => p.id)] },
        primaryLanguage: { notIn: preferredLanguages },
      },
      orderBy: { stars: 'desc' },
      take: 2,
    })
    picked.push(...explore)
  }

  return picked.slice(0, limit)
}
