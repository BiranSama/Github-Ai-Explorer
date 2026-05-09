const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BASE = 'https://api.github.com'

export interface GitHubRepo {
  full_name: string
  name: string
  owner: { login: string }
  description: string | null
  language: string | null
  languages_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  created_at: string
}

export async function fetchGitHubSearch(query: string, sort = 'stars', order = 'desc'): Promise<GitHubRepo[]> {
  const url = `${BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=30`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json() as { items: GitHubRepo[] }
  return data.items
}

export async function fetchTrending(language?: string, since: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<GitHubRepo[]> {
  const date = getDate(since)
  const q = language ? `language:${language} pushed:>${date}` : `pushed:>${date}`
  return fetchGitHubSearch(q, 'stars', 'desc')
}

function getDate(since: 'daily' | 'weekly' | 'monthly'): string {
  const d = new Date()
  if (since === 'daily') d.setDate(d.getDate() - 1)
  else if (since === 'weekly') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  return d.toISOString().split('T')[0]
}
