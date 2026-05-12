'use client'

import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Project } from '@prisma/client'

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  name: string
  fullName: string
  stars: number
  language: string
  val: number
}

interface GraphEdge {
  source: string
  target: string
  weight: number
}

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick: (id: string) => void
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
}

function getNodeColor(node: GraphNode): string {
  return LANGUAGE_COLORS[node.language] || '#888888'
}

export default function KnowledgeGraph({ nodes, edges, onNodeClick }: Props) {
  const fgRef = useRef<any>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)

  const handleNodeClick = useCallback(
    (node: any) => {
      if (node?.id) onNodeClick(node.id)
    },
    [onNodeClick]
  )

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node || null)
  }, [])

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p>暂无图谱数据</p>
          <p className="text-sm mt-1">请先抓取一些项目，然后同步 Embedding</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="h-[600px] rounded-2xl border bg-card/50 overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          graphData={{ nodes, links: edges }}
          nodeLabel={(node: any) => `${node.name}\n⭐ ${node.stars.toLocaleString()}\n${node.language}`}
          nodeColor={(node: any) => getNodeColor(node)}
          nodeVal={(node: any) => node.val}
          nodeRelSize={6}
          linkWidth={(link: any) => Math.max(0.5, link.weight * 2)}
          linkColor={() => 'rgba(150, 150, 150, 0.3)'}
          linkDirectionalArrowLength={0}
          linkDirectionalArrowRelPos={1}
          warmupTicks={100}
          cooldownTicks={50}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          backgroundColor="transparent"
          enableNodeDrag={true}
          enableZoomInteraction={true}
        />
      </div>

      {hoveredNode && (
        <div className="absolute bottom-4 left-4 px-4 py-3 rounded-xl glass border pointer-events-none">
          <p className="font-bold text-sm">{hoveredNode.name}</p>
          <p className="text-xs text-muted-foreground">⭐ {hoveredNode.stars.toLocaleString()} · {hoveredNode.language}</p>
        </div>
      )}
    </div>
  )
}
