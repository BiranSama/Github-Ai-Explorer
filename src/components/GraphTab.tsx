'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import KnowledgeGraph from './KnowledgeGraph'
import ProjectDrawer from './ProjectDrawer'

interface GraphData {
  nodes: any[]
  edges: any[]
  totalNodes: number
  totalEdges: number
}

export default function GraphTab() {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [language, setLanguage] = useState('')
  const [embeddingStats, setEmbeddingStats] = useState({ total: 0, embedded: 0, pending: 0 })

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = language ? `/api/graph?language=${language}` : '/api/graph'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load graph')
      const graphData = await res.json()
      setData(graphData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [language])

  const fetchEmbeddingStats = useCallback(async () => {
    try {
      const res = await fetch('/api/embedding/sync')
      if (res.ok) {
        const stats = await res.json()
        setEmbeddingStats(stats)
      }
    } catch {
      // Ignore
    }
  }, [])

  const syncEmbeddings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/embedding/sync', { method: 'POST' })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      await fetchEmbeddingStats()
      await fetchGraph()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGraph()
    fetchEmbeddingStats()
  }, [fetchGraph, fetchEmbeddingStats])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">知识图谱</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.totalNodes} 个项目 · ${data.totalEdges} 条关联` : '加载中...'}
            {embeddingStats.pending > 0 && ` · ${embeddingStats.pending} 个待同步`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary text-sm border"
          >
            <option value="">全部语言</option>
            <option value="TypeScript">TypeScript</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Go">Go</option>
            <option value="Rust">Rust</option>
            <option value="Java">Java</option>
          </select>

          <button
            onClick={syncEmbeddings}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? '同步中...' : '同步 Embedding'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      {embeddingStats.pending > 0 && embeddingStats.total > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">
          💡 有 {embeddingStats.pending} 个项目尚未计算 Embedding，点击"同步 Embedding"开始分析项目相似度
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center h-[600px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            加载图谱...
          </div>
        </div>
      ) : (
        <KnowledgeGraph
          nodes={data?.nodes || []}
          edges={data?.edges || []}
          onNodeClick={setDrawerId}
        />
      )}

      <ProjectDrawer
        projectId={drawerId}
        onClose={() => setDrawerId(null)}
        onSelectProject={(id) => setDrawerId(id)}
      />
    </div>
  )
}
