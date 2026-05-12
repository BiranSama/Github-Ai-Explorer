import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cosineSimilarity, parseVector } from '@/lib/similarity'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Get source project embedding
    const sourceProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { embedding: true },
    })

    if (!sourceProject?.embedding) {
      return NextResponse.json({ error: 'Project has no embedding' }, { status: 404 })
    }

    const sourceVector = parseVector(sourceProject.embedding.vector)

    // Get all other projects with embeddings
    const candidates = await prisma.project.findMany({
      where: {
        id: { not: projectId },
        embedding: { isNot: null },
      },
      include: { embedding: true },
    })

    // Calculate similarities and sort
    const scored = candidates.map(p => {
      const vector = parseVector(p.embedding!.vector)
      const similarity = cosineSimilarity(sourceVector, vector)
      return { project: p, similarity }
    })

    scored.sort((a, b) => b.similarity - a.similarity)

    const top = scored.slice(0, limit)

    return NextResponse.json({
      source: {
        id: sourceProject.id,
        name: sourceProject.name,
        fullName: sourceProject.fullName,
        stars: sourceProject.stars,
        language: sourceProject.primaryLanguage,
      },
      related: top.map(({ project, similarity }) => ({
        id: project.id,
        name: project.name,
        fullName: project.fullName,
        stars: project.stars,
        language: project.primaryLanguage,
        similarity: Math.round(similarity * 100) / 100,
      })),
    })
  } catch (error) {
    console.error('Related graph API error:', error)
    return NextResponse.json({ error: 'Failed to get related projects' }, { status: 500 })
  }
}
