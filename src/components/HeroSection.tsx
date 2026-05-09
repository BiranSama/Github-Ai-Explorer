'use client'

import { motion } from 'framer-motion'
import GhostCursor from './GhostCursor'

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: '30vh', minHeight: '240px' }}>
      <GhostCursor />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center"
        >
          <span className="text-gradient">GitHub AI Explorer</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-3 text-base md:text-lg text-muted-foreground text-center max-w-xl"
        >
          用 AI 探索 GitHub 热门项目，让技术发现变得简单有趣
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 flex gap-2"
        >
          <span className="px-3 py-1 rounded-full text-xs glass text-muted-foreground">
            🔥 实时 Trending
          </span>
          <span className="px-3 py-1 rounded-full text-xs glass text-muted-foreground">
            🤖 AI 中文解读
          </span>
          <span className="px-3 py-1 rounded-full text-xs glass text-muted-foreground">
            🎯 个性化推荐
          </span>
        </motion.div>
      </div>
    </section>
  )
}
