import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { Project } from '@prisma/client'

export function useProject(id: string | null) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (!id) { setProject(null); return }
    setLoading(true)
    apiGet<Project>(`/api/projects/${encodeURIComponent(id)}`)
      .then(setProject).catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [id])

  const summarize = useCallback(async () => {
    if (!id) return
    setSummaryLoading(true)
    try {
      const result = await apiPost<{ summary: string }>(`/api/projects/${encodeURIComponent(id)}/summarize`, undefined)
      setProject(prev => prev ? { ...prev, aiSummary: result.summary } : prev)
    } finally {
      setSummaryLoading(false)
    }
  }, [id])

  return { project, loading, summaryLoading, error, summarize }
}
