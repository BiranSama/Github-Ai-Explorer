'use client'

import { motion } from 'framer-motion'
import { ROLES, EXPERIENCE_LEVELS } from '@/lib/interests'

interface Props {
  value: string
  onSelect: (role: string, experienceLevel?: string) => void
}

export default function StepRole({ value, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map(role => (
          <motion.button
            key={role.value}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(role.value)}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              value === role.value
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            <span className="text-2xl block mb-2">{role.emoji}</span>
            <span className="text-sm font-medium">{role.label}</span>
          </motion.button>
        ))}
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-muted-foreground">你的经验级别？</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => onSelect(value, level.value)}
                className="px-4 py-2 rounded-xl text-sm border border-border hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                {level.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}