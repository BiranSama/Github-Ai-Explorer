import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { Project } from '@prisma/client'

export function useTrending(language?: string, since?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetch_() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (language) params.set('language', language)
      if (since) params.set('since', since)
      const data = await apiGet<Project[]>(`/api/trending?${params}`)
      setProjects(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function triggerFetch(lang?: string, sin?: string) {
    await apiPost('/api/trending/fetch', { language: lang, since: sin || 'daily' })
    await fetch_()
  }

  useEffect(() => { fetch_() }, [language, since])

  return { projects, loading, error, refetch: () => triggerFetch(language, since) }
}
