import { prisma } from './db'
import { fetchTrending } from './github'

export async function syncTrending(language?: string, since: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const repos = await fetchTrending(language, since)
  for (const repo of repos) {
    await prisma.project.upsert({
      where: { id: repo.full_name },
      create: {
        id: repo.full_name,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        primaryLanguage: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        lastPushed: new Date(repo.pushed_at),
        trendingDate: new Date(),
        fetchedAt: new Date(),
        source: 'search',
      },
      update: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        lastPushed: new Date(repo.pushed_at),
        trendingDate: new Date(),
        source: 'search',
      },
    })
  }
}

export async function getTrending(language?: string, since?: string) {
  const sinceDate = since ? getSinceDate(since) : undefined

  const where: Record<string, unknown> = {}
  if (language) where.primaryLanguage = language
  if (sinceDate) where.trendingDate = { gte: sinceDate }

  return prisma.project.findMany({
    where,
    orderBy: { stars: 'desc' },
    take: 100,
  })
}

function getSinceDate(since: string): Date | undefined {
  const d = new Date()
  if (since === 'daily') d.setDate(d.getDate() - 1)
  else if (since === 'weekly') d.setDate(d.getDate() - 7)
  else if (since === 'monthly') d.setMonth(d.getMonth() - 1)
  else return undefined
  return d
}
