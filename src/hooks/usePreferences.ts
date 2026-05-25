import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api'

export interface UserPreferences {
  preferredLanguages: string[]
  notifyEnabled: boolean
  notifyInterval: number
  onboardingCompleted: boolean
  role: string | null
  experienceLevel: string | null
  interests: string[]
  techStack: string[]
  goals: string[]
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<UserPreferences>('/api/preferences')
      setPrefs(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      const data = await apiPut<UserPreferences>('/api/preferences', updates)
      setPrefs(data)
    } catch (e) {
      setError(String(e))
      throw e
    }
  }, [])

  const initProfile = useCallback(async (profile: {
    role: string
    experienceLevel?: string
    interests: string[]
    techStack?: string[]
    goals?: string[]
    preferredLanguages?: string[]
  }) => {
    try {
      const data = await apiPost<UserPreferences>('/api/preferences/init', profile)
      setPrefs(data)
    } catch (e) {
      setError(String(e))
      throw e
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { prefs, loading, error, update, initProfile }
}