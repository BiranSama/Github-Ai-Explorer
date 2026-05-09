'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@prisma/client'
import ProjectCard from './ProjectCard'

interface Props {
  projects: Project[]
  onSelect: (id: string) => void
}

export default function StackCard({ projects, onSelect }: Props) {
  const displayProjects = projects.slice(0, 3)

  if (displayProjects.length === 0) return null

  return (
    <div className="relative">
      {/* 提示文字 */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          💡 点击顶部卡片查看详情，或按"换一批"切换推荐
        </p>
      </div>

      <div className="relative h-[420px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {displayProjects.map((project, index) => {
            const isTop = index === 0
            const scale = 1 - index * 0.06
            const y = index * 14
            const opacity = 1 - index * 0.3

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: -40, scale: 0.9, rotateZ: -5 }}
                animate={{ opacity, y, scale, rotateZ: index * 2 }}
                exit={{ opacity: 0, y: 80, scale: 0.85, rotateZ: 5, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 28, delay: index * 0.06 }}
                className="absolute w-full max-w-md"
                style={{ zIndex: 3 - index }}
              >
                <div
                  className={`transition-all duration-200 ${isTop ? 'cursor-pointer hover:-translate-y-1' : 'pointer-events-none'}`}
                  onClick={() => isTop && onSelect(project.id)}
                >
                  <ProjectCard project={project} />
                  {isTop && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-lg shadow-primary/30 pointer-events-none"
                    >
                      点击查看详情 →
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
