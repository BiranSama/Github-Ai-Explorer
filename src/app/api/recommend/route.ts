import { NextResponse } from 'next/server'
import { getRecommendations } from '@/lib/recommend'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const languages = searchParams.get('languages')?.split(',').filter(Boolean) || []
  const role = searchParams.get('role') || undefined
  const experienceLevel = searchParams.get('experienceLevel') || undefined
  const interests = searchParams.get('interests')?.split(',').filter(Boolean) || []
  const techStack = searchParams.get('techStack')?.split(',').filter(Boolean) || []
  const goals = searchParams.get('goals')?.split(',').filter(Boolean) || []

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
