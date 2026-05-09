import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSummary } from '@/lib/llm'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  const project = await prisma.project.findUnique({ where: { id: decoded } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.aiSummary) return NextResponse.json({ summary: project.aiSummary, cached: true })
  if (!process.env.LLM_API_KEY) return NextResponse.json({ error: 'LLM not configured' }, { status: 503 })

  const summary = await generateSummary({
    name: project.name,
    description: project.description,
    primaryLanguage: project.primaryLanguage,
    stars: project.stars,
    lastPushed: project.lastPushed,
  })

  await prisma.project.update({
    where: { id: decoded },
    data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
  })

  return NextResponse.json({ summary, cached: false })
}
