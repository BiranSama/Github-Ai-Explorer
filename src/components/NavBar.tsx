'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import PreferencesPanel from './PreferencesPanel'
import { ThemeToggle } from './ThemeProvider'

interface Props {
  activeTab: 'trending' | 'search' | 'recommend' | 'graph'
  onTabChange: (tab: 'trending' | 'search' | 'recommend' | 'graph') => void
}

const tabs = [
  { id: 'trending' as const, label: '热门榜单' },
  { id: 'search' as const, label: '搜索发现' },
  { id: 'recommend' as const, label: 'AI推荐' },
  { id: 'graph' as const, label: '知识图谱' },
]

export default function NavBar({ activeTab, onTabChange }: Props) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-[25] border-b glass">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg hidden md:inline">GitHub AI Explorer</span>
          </div>

          <div className="relative flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors z-10"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform text-muted-foreground hover:text-foreground"
              aria-label="设置"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 z-0 bg-black/50" onClick={() => setShowSettings(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 m-auto"
          >
            <PreferencesPanel onClose={() => setShowSettings(false)} />
          </motion.div>
        </div>
      )}
    </>
  )
}
