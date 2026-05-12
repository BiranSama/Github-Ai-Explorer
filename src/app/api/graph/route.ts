import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cosineSimilarity, parseVector } from '@/lib/similarity'

const prisma = new PrismaClient()
const THRESHOLD = 0.75
const DEFAULT_LIMIT = 100

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
    const language = searchParams.get('language')

    // Get projects with embeddings
    const projects = await prisma.project.findMany({
      where: language ? { primaryLanguage: language } : undefined,
      include: { embedding: true },
      orderBy: { stars: 'desc' },
      take: limit,
    })

    const projectsWithEmbeddings = projects.filter(p => p.embedding !== null)

    // Build nodes
    const nodes = projectsWithEmbeddings.map(p => ({
      id: p.id,
      name: p.name,
      fullName: p.fullName,
      stars: p.stars,
      language: p.primaryLanguage || 'Unknown',
      val: Math.log(p.stars + 1) * 2, // Node size
    }))

    // Calculate edges (similarity > threshold)
    const edges: { source: string; target: string; weight: number }[] = []
    const vectors = projectsWithEmbeddings.map(p => parseVector(p.embedding!.vector))

    for (let i = 0; i < projectsWithEmbeddings.length; i++) {
      for (let j = i + 1; j < projectsWithEmbeddings.length; j++) {
        const similarity = cosineSimilarity(vectors[i], vectors[j])
        if (similarity >= THRESHOLD) {
          edges.push({
            source: projectsWithEmbeddings[i].id,
            target: projectsWithEmbeddings[j].id,
            weight: similarity,
          })
        }
      }
    }

    return NextResponse.json({ nodes, edges, totalNodes: nodes.length, totalEdges: edges.length })
  } catch (error) {
    console.error('Graph API error:', error)
    return NextResponse.json({ error: 'Failed to generate graph' }, { status: 500 })
  }
}
