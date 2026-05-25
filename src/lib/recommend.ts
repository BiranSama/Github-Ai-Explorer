import { prisma } from './db'
import { matchInterests, getRelatedTech, INTEREST_AREAS } from './interests'

export interface RecommendReason {
  type: 'interest' | 'language' | 'techstack' | 'explore'
  label: string
}

export interface RecommendResult {
  project: Awaited<ReturnType<typeof prisma.project.findMany>>[number]
  reason: RecommendReason
}

export interface RecommendContext {
  role?: string
  experienceLevel?: string
  interests?: string[]
  techStack?: string[]
  goals?: string[]
  preferredLanguages?: string[]
  limit?: number
  excludeProjectIds?: string[]
}

const WEIGHTS = {
  interest: 0.40,
  language: 0.25,
  techstack: 0.20,
  explore: 0.15,
}

function interestLabel(interest: string): string {
  const area = INTEREST_AREAS.find(a => a.value === interest)
  return area ? `匹配你的${area.label}兴趣` : `匹配你的${interest}兴趣`
}

function scoreProject(
  project: {
    description: string | null
    primaryLanguage: string | null
    name: string
    stars: number
  },
  ctx: RecommendContext
): { score: number; reason: RecommendReason } {
  const userInterests = ctx.interests || []
  const userTech = ctx.techStack || []
  const userLangs = ctx.preferredLanguages || []
  const allLangs = [...new Set([...userLangs, ...userTech.map(t => t.charAt(0).toUpperCase() + t.slice(1))])]

  const matchedInterests = matchInterests(project.description, [], userInterests)
  const relatedTech = getRelatedTech(userTech)
  const nameLower = project.name.toLowerCase()
  const descLower = (project.description || '').toLowerCase()

  let bestReason: RecommendReason = { type: 'language', label: `热门项目` }
  let score = 0

  if (matchedInterests.length > 0) {
    score += WEIGHTS.interest
    bestReason = { type: 'interest', label: interestLabel(matchedInterests[0]) }
  }

  if (project.primaryLanguage && allLangs.some(l => l.toLowerCase() === project.primaryLanguage!.toLowerCase())) {
    score += WEIGHTS.language
    if (score <= WEIGHTS.language) {
      bestReason = { type: 'language', label: `${project.primaryLanguage} 语言匹配` }
    }
  }

  const isTechRelated = relatedTech.some(tech => nameLower.includes(tech) || descLower.includes(tech))
  if (isTechRelated) {
    score += WEIGHTS.techstack
    if (bestReason.type !== 'interest') {
      const matchedRelated = relatedTech.find(tech => nameLower.includes(tech) || descLower.includes(tech))
      bestReason = { type: 'techstack', label: `与你的${matchedRelated || ''}技术栈相关` }
    }
  }

  score += (project.stars / 200000) * 0.1

  return { score, reason: bestReason }
}

export async function getRecommendations(ctx: RecommendContext = {}): Promise<RecommendResult[]> {
  const {
    interests = [],
    techStack = [],
    preferredLanguages = [],
    limit = 10,
    excludeProjectIds = [],
  } = ctx

  const allLangs = [...new Set([...preferredLanguages, ...techStack.map(t => t.charAt(0).toUpperCase() + t.slice(1))])]

  const candidates = await prisma.project.findMany({
    where: {
      id: { notIn: excludeProjectIds },
    },
    orderBy: { stars: 'desc' },
    take: 200,
  })

  if (candidates.length === 0) return []

  const scored = candidates.map(project => {
    const { score, reason } = scoreProject(project, ctx)
    return { project, score, reason }
  })

  scored.sort((a, b) => b.score - a.score)

  const mainPicks = scored.slice(0, Math.max(limit - 2, Math.ceil(limit * 0.8)))

  const mainIds = new Set(mainPicks.map(p => p.project.id))

  if (allLangs.length > 0 || interests.length > 0) {
    const exploreCandidates = candidates.filter(p =>
      !mainIds.has(p.id) &&
      !allLangs.some(l => l.toLowerCase() === p.primaryLanguage?.toLowerCase())
    )

    const relatedTech = getRelatedTech(techStack)
    const nonRelatedExplore = exploreCandidates.filter(p => {
      const nameLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()
      return !relatedTech.some(tech => nameLower.includes(tech) || descLower.includes(tech))
    })

    const pool = nonRelatedExplore.length > 0 ? nonRelatedExplore : exploreCandidates
    const shuffled = pool.sort(() => Math.random() - 0.5)
    const explorePicks = shuffled.slice(0, 2).map(p => ({
      project: p,
      score: 0,
      reason: { type: 'explore' as const, label: '探索发现：走出舒适区' },
    }))

    return [...mainPicks.map(p => ({ project: p.project, reason: p.reason })), ...explorePicks].slice(0, limit)
  }

  return mainPicks.map(p => ({ project: p.project, reason: p.reason })).slice(0, limit)
}