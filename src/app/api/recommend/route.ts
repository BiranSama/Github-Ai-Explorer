import { NextResponse } from 'next/server'
import { getRecommendations } from '@/lib/recommend'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const langs = searchParams.get('languages')?.split(',').filter(Boolean) || []
  const pushed = await prisma.pushLog.findMany({ orderBy: { pushedAt: 'desc' }, take: 50 })
  const excludeIds = pushed.map(p => p.projectId)
  const projects = await getRecommendations({ preferredLanguages: langs, limit: 10, excludeProjectIds: excludeIds })
  return NextResponse.json(projects)
}
