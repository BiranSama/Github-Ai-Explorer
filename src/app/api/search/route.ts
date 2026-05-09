import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const language = searchParams.get('language') || undefined
  const minStars = parseInt(searchParams.get('minStars') || '0')
  const updatedAfter = searchParams.get('updatedAfter') || undefined

  const projects = await prisma.project.findMany({
    where: {
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { owner: { contains: q } },
        ],
      } : {}),
      ...(language ? { primaryLanguage: language } : {}),
      ...(minStars ? { stars: { gte: minStars } } : {}),
      ...(updatedAfter ? { lastPushed: { gte: new Date(updatedAfter) } } : {}),
    },
    orderBy: { stars: 'desc' },
    take: 50,
  })
  return NextResponse.json(projects)
}
