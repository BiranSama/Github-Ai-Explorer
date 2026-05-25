import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { Project } from '@prisma/client'
import type { RecommendReason } from '@/lib/recommend'

export interface RecommendItem {
  project: Project
  reason?: RecommendReason
}

interface RecommendParams {
  languages?: string[]
  role?: string | null
  interests?: string[]
  techStack?: string[]
  goals?: string[]
}

export function useRecommend(params: RecommendParams = {}) {
  const [items, setItems] = useState<RecommendItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paramsKey = [params.languages?.join(','), params.role, params.interests?.join(','), params.techStack?.join(','), params.goals?.join(',')].join('|')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const searchParams = new URLSearchParams()
      if (params.languages?.length) searchParams.set('languages', params.languages.join(','))
      if (params.role) searchParams.set('role', params.role)
      if (params.interests?.length) searchParams.set('interests', params.interests.join(','))
      if (params.techStack?.length) searchParams.set('techStack', params.techStack.join(','))
      if (params.goals?.length) searchParams.set('goals', params.goals.join(','))
      const data = await apiGet<RecommendItem[]>(`/api/recommend?${searchParams}`)
      setItems(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [paramsKey])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiPost<RecommendItem[]>('/api/recommend/refresh', {
        languages: params.languages,
        role: params.role,
        interests: params.interests,
        techStack: params.techStack,
        goals: params.goals,
      })
      setItems(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [paramsKey])

  useEffect(() => { fetch_() }, [fetch_])

  return { items, loading, error, refresh }
}