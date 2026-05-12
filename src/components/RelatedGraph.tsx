'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface RelatedProject {
  id: string
  name: string
  fullName: string
  stars: number
  language: string | null
  similarity: number
}

interface Props {
  projectId: string
  onSelectProject: (id: string) => void
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
}

export default function RelatedGraph({ projectId, onSelectProject }: Props) {
  const [data, setData] = useState<{ source: any; related: RelatedProject[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return

    const fetchRelated = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/graph/related?projectId=${projectId}&limit=8`)
        if (!res.ok) throw new Error('Failed')
        const result = await res.json()
        setData(result)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        分析关联项目中...
      </div>
    )
  }

  if (!data || data.related.length === 0) return null

  // Build small graph: center node + surrounding related nodes
  const centerNode = {
    id: data.source.id,
    name: data.source.name,
    val: 8,
    color: '#6366f1',
    isCenter: true,
  }

  const relatedNodes = data.related.map((p) => ({
    id: p.id,
    name: p.name,
    val: 4 + p.similarity * 4,
    color: LANGUAGE_COLORS[p.language || ''] || '#888888',
    similarity: p.similarity,
  }))

  const links = data.related.map((p) => ({
    source: data.source.id,
    target: p.id,
    value: p.similarity,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="border-t pt-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <h3 className="font-semibold">相关项目</h3>
        <span className="text-xs text-muted-foreground">({data.related.length} 个)</span>
      </div>

      <div className="h-[280px] rounded-xl border bg-card/30 overflow-hidden">
        <ForceGraph2D
          graphData={{ nodes: [centerNode, ...relatedNodes], links }}
          nodeLabel={(node: any) =>
            `${node.name}${node.similarity ? ` (相似度: ${Math.round(node.similarity * 100)}%)` : ''}`
          }
          nodeColor={(node: any) => node.color}
          nodeVal={(node: any) => node.val}
          nodeRelSize={5}
          linkWidth={(link: any) => link.value * 2}
          linkColor={() => 'rgba(150, 150, 150, 0.4)'}
          warmupTicks={50}
          cooldownTicks={30}
          onNodeClick={(node: any) => {
            if (!node.isCenter && node.id) onSelectProject(node.id)
          }}
          backgroundColor="transparent"
          enableNodeDrag={false}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {data.related.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {p.name}
            <span className="ml-1 opacity-60">{Math.round(p.similarity * 100)}%</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
