'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@prisma/client'
import ProjectCard from './ProjectCard'

interface Props {
  projects: Project[]
  onSelect: (id: string) => void
  batchKey: string | number
}

export default function BatchGrid({ projects, onSelect, batchKey }: Props) {
  const displayProjects = projects.slice(0, 6)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={batchKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {displayProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.06,
              duration: 0.4,
              ease: 'easeOut',
            }}
          >
            <ProjectCard
              project={project}
              onClick={() => onSelect(project.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
