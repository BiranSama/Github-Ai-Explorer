import { NextResponse } from 'next/server'
import { getRecommendations } from '@/lib/recommend'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const languages: string[] = body.languages || []
  const role: string | undefined = body.role || undefined
  const experienceLevel: string | undefined = body.experienceLevel || undefined
  const interests: string[] = body.interests || []
  const techStack: string[] = body.techStack || []
  const goals: string[] = body.goals || []
  const pushed = await prisma.pushLog.findMany({ orderBy: { pushedAt: 'desc' }, take: 50 })
  const excludeIds = pushed.map(p => p.projectId)

  const results = await getRecommendations({
    role,
    experienceLevel,
    interests,
    techStack,
    goals,
    preferredLanguages: languages,
    limit: 10,
    excludeProjectIds: excludeIds,
  })

  return NextResponse.json(results)
}