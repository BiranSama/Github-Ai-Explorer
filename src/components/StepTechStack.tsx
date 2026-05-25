'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TECH_STACK_OPTIONS } from '@/lib/interests'

interface Props {
  value: string[]
  onBack: () => void
  onSelect: (techStack: string[]) => void
  loading?: boolean
}

export default function StepTechStack({ value, onBack, onSelect, loading }: Props) {
  const [selected, setSelected] = useState<string[]>(value)
  const [customInput, setCustomInput] = useState('')

  function toggleTech(tech: string) {
    setSelected(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  function addCustomTech() {
    const trimmed = customInput.trim().toLowerCase()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected(prev => [...prev, trimmed])
      setCustomInput('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTech()
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">选择你日常使用的技术栈（可跳过）</p>

      <div className="flex flex-wrap gap-2">
        {TECH_STACK_OPTIONS.map(tech => {
          const isSelected = selected.includes(tech)
          return (
            <motion.button
              key={tech}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTech(tech)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {tech}
            </motion.button>
          )
        })}
      </div>

      {selected.filter(t => !TECH_STACK_OPTIONS.includes(t as typeof TECH_STACK_OPTIONS[number])).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected
            .filter(t => !TECH_STACK_OPTIONS.includes(t as typeof TECH_STACK_OPTIONS[number]))
            .map(tech => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-lg text-sm bg-accent text-accent-foreground flex items-center gap-1"
              >
                {tech}
                <button
                  onClick={() => toggleTech(tech)}
                  className="hover:text-destructive transition-colors"
                >
                  ×
                </button>
              </motion.span>
            ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加自定义技术..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <button
          onClick={addCustomTech}
          disabled={!customInput.trim()}
          className="px-4 py-2.5 rounded-xl text-sm bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-50 transition-colors"
        >
          添加
        </button>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 上一步
        </button>
        <button
          onClick={() => onSelect(selected)}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
              保存中...
            </>
          ) : (
            '完成设置 ✓'
          )}
        </button>
      </div>
    </div>
  )
}