import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getEmbedding, buildEmbeddingText } from '@/lib/embedding'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Find projects without embeddings
    const projects = await prisma.project.findMany({
      where: {
        embedding: null,
      },
      take: 50, // Batch size
    })

    if (projects.length === 0) {
      return NextResponse.json({ message: 'All projects already have embeddings', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const project of projects) {
      try {
        const text = buildEmbeddingText(project)
        const vector = await getEmbedding(text)

        await prisma.projectEmbedding.create({
          data: {
            projectId: project.id,
            vector: JSON.stringify(vector),
          },
        })

        processed++
      } catch (err) {
        console.error(`Failed to embed ${project.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} projects, ${errors} errors`,
      processed,
      errors,
      remaining: await prisma.project.count({ where: { embedding: null } }),
    })
  } catch (error) {
    console.error('Embedding sync error:', error)
    return NextResponse.json({ error: 'Failed to sync embeddings' }, { status: 500 })
  }
}

export async function GET() {
  const total = await prisma.project.count()
  const embedded = await prisma.projectEmbedding.count()
  return NextResponse.json({ total, embedded, pending: total - embedded })
}
