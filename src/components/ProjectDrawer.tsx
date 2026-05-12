'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProject } from '@/hooks/useProject'
import ElectricBorder from './ElectricBorder'
import RelatedGraph from './RelatedGraph'

interface Props {
  projectId: string | null
  onClose: () => void
  onSelectProject?: (id: string) => void
}

export default function ProjectDrawer({ projectId, onClose, onSelectProject }: Props) {
  const { project, loading, summaryLoading, error, summarize } = useProject(projectId)

  useEffect(() => {
    if (projectId && project && !project.aiSummary) {
      summarize()
    }
  }, [projectId, project?.aiSummary, summarize])

  // 锁定 body 滚动，防止滚动条闪烁
  useEffect(() => {
    if (projectId) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [projectId])

  return (
    <AnimatePresence>
      {projectId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 ml-auto w-full max-w-lg h-full overflow-y-scroll"
          >
            <ElectricBorder active className="h-full" chaos={0.4} speed={2} borderRadius={0}>
              <div className="h-full bg-background/95 backdrop-blur-xl p-6">
                {loading && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                )}

                {error && <div className="text-red-500 py-4">{error}</div>}

                {project && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{project.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{project.owner}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onClose() }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      {project.primaryLanguage && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {project.primaryLanguage}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {project.stars?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {project.forks?.toLocaleString()}
                      </span>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* AI Summary */}
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="font-semibold">AI 项目说明</h3>
                      </div>

                      {summaryLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            AI 分析中...
                          </motion.div>
                        </div>
                      )}

                      {project.aiSummary && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm leading-relaxed text-foreground/90"
                        >
                          {project.aiSummary}
                        </motion.p>
                      )}
                    </div>

                    {/* Related Projects Graph */}
                    {projectId && onSelectProject && (
                      <RelatedGraph projectId={projectId} onSelectProject={onSelectProject} />
                    )}

                    {/* Action */}
                    <div className="mt-8">
                      <a
                        href={`https://github.com/${projectId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        在 GitHub 查看
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </ElectricBorder>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
