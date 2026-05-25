'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRecommend } from '@/hooks/useRecommend'
import { usePreferences } from '@/hooks/usePreferences'
import { INTEREST_AREAS, ROLES } from '@/lib/interests'
import ProjectCard from './ProjectCard'
import ProjectDrawer from './ProjectDrawer'

export default function RecommendTab() {
  const { prefs } = usePreferences()
  const { items, loading, error, refresh } = useRecommend({
    languages: prefs?.preferredLanguages,
    role: prefs?.role,
    interests: prefs?.interests,
    techStack: prefs?.techStack,
    goals: prefs?.goals,
  })
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [batchKey, setBatchKey] = useState(0)

  async function handleRefresh() {
    setBatchKey(prev => prev + 1)
    await refresh()
  }

  const interestLabels = prefs?.interests?.map(i => {
    const area = INTEREST_AREAS.find(a => a.value === i)
    return area?.label || i
  }) || []

  const roleLabel = prefs?.role ? (ROLES.find(r => r.value === prefs.role)?.label || prefs.role) : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">为你精选</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {interestLabels.length > 0
              ? `基于你的兴趣：${interestLabels.join(' · ')}`
              : '请在设置中完善你的兴趣画像'}
            {roleLabel ? ` · ${roleLabel}` : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              换一批中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              换一批
            </>
          )}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p>请先在设置中完善你的兴趣画像，我们会为你精选项目</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.project.id + '-' + batchKey}>
            <ProjectCard
              project={item.project}
              reason={item.reason}
              onClick={() => setDrawerId(item.project.id)}
            />
          </div>
        ))}
      </div>

      <ProjectDrawer
        projectId={drawerId}
        onClose={() => setDrawerId(null)}
        onSelectProject={(id) => setDrawerId(id)}
      />
    </div>
  )
}