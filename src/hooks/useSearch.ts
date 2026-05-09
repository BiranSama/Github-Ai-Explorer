import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '@/lib/api'
import type { Project } from '@prisma/client'

export function useSearch(query: string, language?: string, minStars?: number) {
  const [results, setResults] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (language) params.set('language', language)
      if (minStars) params.set('minStars', String(minStars))
      const data = await apiGet<Project[]>(`/api/search?${params}`)
      setResults(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [query, language, minStars])

  useEffect(() => {
    if (!query && !language) { setResults([]); return }
    const timer = setTimeout(() => { fetch_() }, 300)
    return () => clearTimeout(timer)
  }, [fetch_])

  return { results, loading, error, refetch: fetch_ }
}
