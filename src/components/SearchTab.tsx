'use client'
import { useState, useDeferredValue } from 'react'
import { motion } from 'framer-motion'
import { useSearch } from '@/hooks/useSearch'
import ProjectCard from './ProjectCard'
import ProjectDrawer from './ProjectDrawer'
import LanguageFilter from './LanguageFilter'

export default function SearchTab() {
  const [q, setQ] = useState('')
  const deferredQ = useDeferredValue(q)
  const [lang, setLang] = useState<string | undefined>()
  const [minStars, setMinStars] = useState<number>(0)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const { results, loading, error } = useSearch(deferredQ, lang, minStars)

  return (
    <>
      <div className="flex gap-6">
        <aside className="w-44 shrink-0 space-y-6">
          <div className="glass rounded-xl p-4 space-y-4">
            <LanguageFilter value={lang} onChange={setLang} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">最小 Stars</label>
              <input
                type="number"
                value={minStars || ''}
                onChange={e => setMinStars(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
                placeholder="0"
                min={0}
              />
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-6 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
              placeholder="搜索项目名称、描述、作者..."
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2"
              />
              搜索中...
            </div>
          )}

          {error && <div className="text-red-500 py-4">{error}</div>}

          {!loading && results.length === 0 && deferredQ && (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>没有找到相关项目</p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProjectCard project={project} onClick={() => setDrawerId(project.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ProjectDrawer projectId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  )
}
