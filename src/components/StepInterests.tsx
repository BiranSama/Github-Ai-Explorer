'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { INTEREST_AREAS, GOALS } from '@/lib/interests'

interface Props {
  value: string[]
  onBack: () => void
  onSelect: (interests: string[], goals: string[]) => void
}

export default function StepInterests({ value, onBack, onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>(value)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  function toggleInterest(interest: string) {
    setSelected(prev => {
      const next = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
      return next
    })
  }

  function toggleGoal(goal: string) {
    setSelectedGoals(prev => {
      const next = prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
      return next
    })
  }

  function handleNext() {
    onSelect(selected, selectedGoals)
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">至少选择 1 个</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INTEREST_AREAS.map(area => {
          const isSelected = selected.includes(area.value)
          return (
            <motion.button
              key={area.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleInterest(area.value)}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              <span className="text-2xl block mb-2">{area.emoji}</span>
              <span className="text-sm font-medium">{area.label}</span>
            </motion.button>
          )
        })}
      </div>

      <div className="space-y-3 pt-4">
        <p className="text-sm font-medium text-muted-foreground">学习目标（可多选）</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(goal => {
            const isSelected = selectedGoals.includes(goal.value)
            return (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {goal.emoji} {goal.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 上一步
        </button>
        <button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          下一步
        </button>
      </div>
    </div>
  )
}