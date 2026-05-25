'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '@prisma/client'
import type { RecommendReason } from '@/lib/recommend'
import ElectricBorder from './ElectricBorder'

const REASON_COLORS: Record<string, string> = {
  interest: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  language: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  techstack: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  explore: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const langColors: Record<string, string> = {
  TypeScript: 'from-blue-400 to-blue-600',
  JavaScript: 'from-yellow-400 to-yellow-600',
  Python: 'from-yellow-300 to-blue-500',
  Rust: 'from-orange-500 to-red-600',
  Go: 'from-cyan-400 to-blue-500',
  Java: 'from-red-400 to-orange-500',
  'C++': 'from-blue-500 to-indigo-600',
  Ruby: 'from-red-400 to-pink-600',
  Swift: 'from-orange-400 to-red-500',
  Kotlin: 'from-purple-400 to-pink-500',
  PHP: 'from-indigo-400 to-purple-500',
  Vue: 'from-green-400 to-emerald-600',
  React: 'from-cyan-400 to-blue-500',
}

function getLangGradient(lang: string | null): string {
  if (!lang) return 'from-slate-400 to-slate-600'
  return langColors[lang] || 'from-slate-400 to-slate-600'
}

interface Props {
  project: Project
  reason?: RecommendReason
  onClick?: () => void
}

export default function ProjectCard({ project, reason, onClick }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <ElectricBorder active={hovered} chaos={0.3} speed={3} borderRadius={16}>
      <motion.div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl p-5 cursor-pointer transition-colors glass hover:bg-accent/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.owner}</p>
          </div>
          {project.primaryLanguage && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getLangGradient(project.primaryLanguage)} shrink-0 shadow-sm`}>
              {project.primaryLanguage}
            </span>
          )}
        </div>

        {project.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {project.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {project.forks.toLocaleString()}
          </span>
        </div>

        {reason && (
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${REASON_COLORS[reason.type] || REASON_COLORS.interest}`}>
              {reason.type === 'interest' && '🎯'}
              {reason.type === 'language' && '💻'}
              {reason.type === 'techstack' && '🔗'}
              {reason.type === 'explore' && '✨'}
              {reason.label}
            </span>
          </div>
        )}
      </motion.div>
    </ElectricBorder>
  )
}
