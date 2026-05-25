import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecommendations } from '@/lib/recommend'

vi.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
    },
    pushLog: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

function makeProject(id: string, name: string, owner: string, description: string, language: string, stars: number) {
  return {
    id, name, fullName: `${owner}/${name}`, owner,
    description, primaryLanguage: language, languages: '[]', stars,
    forks: Math.floor(stars * 0.2), openIssues: 100, lastPushed: new Date(), trendingDate: new Date(),
    source: 'search', aiSummary: null, aiSummaryGeneratedAt: null, fetchedAt: new Date(),
    starsYesterday: stars - 500, lastGrowthUpdate: null, embedding: null,
  }
}

const mockProjects = [
  makeProject('1', 'react', 'facebook', 'A JavaScript library for building user interfaces', 'JavaScript', 200000),
  makeProject('2', 'next.js', 'vercel', 'The React Framework for the Web', 'TypeScript', 120000),
  makeProject('3', 'django', 'django', 'The Web framework for perfectionists with deadlines', 'Python', 80000),
  makeProject('4', 'langchain', 'langchain-ai', 'Building applications with LLMs through composability', 'Python', 90000),
  makeProject('5', 'kubernetes', 'kubernetes', 'Production-Grade Container Scheduling and Management', 'Go', 110000),
  makeProject('6', 'rails', 'rails', 'A full-stack Web framework for Ruby', 'Ruby', 55000),
  makeProject('7', 'swift', 'apple', 'The Swift Programming Language', 'Swift', 66000),
  makeProject('8', 'rust', 'rust-lang', 'Empowering everyone to build reliable and efficient software', 'Rust', 95000),
  makeProject('9', 'godot', 'godotengine', 'Free and open source game engine', 'C++', 90000),
  makeProject('10', 'flutter', 'flutter', 'A framework for building cross-platform UIs', 'Dart', 165000),
  makeProject('11', 'tensorflow', 'tensorflow', 'An open source machine learning framework', 'C++', 185000),
  makeProject('12', 'gin', 'gin-gonic', 'A HTTP web framework written in Go', 'Go', 78000),
]

describe('getRecommendations with context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.pushLog.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  it('returns projects with interest-based reasons', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects)

    const results = await getRecommendations({
      interests: ['ai-ml'],
      techStack: ['react'],
      preferredLanguages: ['TypeScript', 'Python'],
      limit: 5,
      excludeProjectIds: [],
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(5)
    
    const aiProjects = results.filter(r => r.reason?.type === 'interest')
    expect(aiProjects.some(r => r.reason?.label.includes('AI'))).toBe(true)
  })

  it('returns projects with language-based reasons', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects)

    const results = await getRecommendations({
      interests: [],
      techStack: [],
      preferredLanguages: ['TypeScript'],
      limit: 5,
      excludeProjectIds: [],
    })

    const langProjects = results.filter(r => r.reason?.type === 'language')
    expect(langProjects.some(r => r.project.primaryLanguage === 'TypeScript')).toBe(true)
  })

  it('returns explore recommendations for diversity', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects)

    const results = await getRecommendations({
      interests: ['web-dev'],
      techStack: ['react'],
      preferredLanguages: ['TypeScript', 'JavaScript'],
      limit: 10,
      excludeProjectIds: [],
    })

    const exploreProjects = results.filter(r => r.reason?.type === 'explore')
    expect(exploreProjects.length).toBeGreaterThan(0)
  })

  it('returns empty array when no projects found', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const results = await getRecommendations({
      interests: ['web-dev'],
      preferredLanguages: ['TypeScript'],
      limit: 5,
      excludeProjectIds: [],
    })

    expect(results).toEqual([])
  })

  it('excludes specified project IDs', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockProjects.filter(p => !['1', '2'].includes(p.id))
    )

    const results = await getRecommendations({
      interests: [],
      preferredLanguages: [],
      limit: 10,
      excludeProjectIds: ['1', '2'],
    })

    expect(results.every(r => !['1', '2'].includes(r.project.id))).toBe(true)
  })

  it('handles empty interests and languages gracefully', async () => {
    ;(prisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects)

    const results = await getRecommendations({
      interests: [],
      techStack: [],
      preferredLanguages: [],
      limit: 5,
      excludeProjectIds: [],
    })

    expect(results.length).toBeLessThanOrEqual(5)
  })
})