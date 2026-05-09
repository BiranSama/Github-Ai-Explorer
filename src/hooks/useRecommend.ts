import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { Project } from '@prisma/client'

export function useRecommend(languages: string[] = []) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const languagesKey = languages.join(',')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (languages.length) params.set('languages', languagesKey)
      const data = await apiGet<Project[]>(`/api/recommend?${params}`)
      setProjects(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [languagesKey])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiPost<Project[]>(`/api/recommend/refresh`, { languages })
      setProjects(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [languages])

  useEffect(() => { fetch_() }, [fetch_])

  return { projects, loading, error, refresh }
}
