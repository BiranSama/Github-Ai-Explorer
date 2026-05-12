'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTrending } from '@/hooks/useTrending'
import ProjectCard from './ProjectCard'
import ProjectDrawer from './ProjectDrawer'
import LanguageFilter from './LanguageFilter'

export default function TrendingTab() {
  const [lang, setLang] = useState<string | undefined>()
  const [since, setSince] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const { projects, loading, error, refetch } = useTrending(lang, since)

  return (
    <>
      <div className="flex gap-6">
        <aside className="w-44 shrink-0 space-y-6">
          <div className="glass rounded-xl p-4 space-y-4">
            <LanguageFilter value={lang} onChange={setLang} />
            <div className="space-y-2">
              <p className="text-sm font-medium px-1 text-muted-foreground">时间范围</p>
              {(['daily','weekly','monthly'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSince(s)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    since === s
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {s === 'daily' ? '🔥 今日' : s === 'weekly' ? '📅 本周' : '📊 本月'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新榜单
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-3"
              />
              加载中...
            </div>
          )}

          {error && <div className="text-red-500 py-4">{error}</div>}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>暂无数据，点击刷新获取最新</p>
            </div>
          )}

          <div className="space-y-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} onClick={() => setDrawerId(project.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ProjectDrawer
        projectId={drawerId}
        onClose={() => setDrawerId(null)}
        onSelectProject={(id) => setDrawerId(id)}
      />
    </>
  )
}
