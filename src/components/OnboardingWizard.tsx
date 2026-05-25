'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StepRole from './StepRole'
import StepInterests from './StepInterests'
import StepTechStack from './StepTechStack'

const STEPS = [StepRole, StepInterests, StepTechStack]
const STEP_TITLES = ['你是做什么的？', '你对什么感兴趣？', '你日常在用什么？']

interface Props {
  onComplete: (profile: {
    role: string
    experienceLevel?: string
    interests: string[]
    techStack?: string[]
    goals?: string[]
    preferredLanguages?: string[]
  }) => Promise<void>
}

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<{
    role: string
    experienceLevel?: string
    interests: string[]
    techStack: string[]
    goals: string[]
  }>({
    role: '',
    interests: [],
    techStack: [],
    goals: [],
  })
  const [loading, setLoading] = useState(false)

  function handleNext(stepData: Partial<typeof data>) {
    setData(prev => ({ ...prev, ...stepData }))
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleFinish(stepData: Partial<typeof data>) {
    const finalData = { ...data, ...stepData }
    setLoading(true)
    try {
      await onComplete(finalData)
    } finally {
      setLoading(false)
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{STEP_TITLES[step]}</h1>
          <p className="text-sm text-muted-foreground">
            第 {step + 1} 步，共 {STEPS.length} 步
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepRole
                value={data.role}
                onSelect={(role, experienceLevel) => handleNext({ role, experienceLevel })}
              />
            )}
            {step === 1 && (
              <StepInterests
                value={data.interests}
                onBack={handleBack}
                onSelect={(interests, goals) => handleNext({ interests, goals })}
              />
            )}
            {step === 2 && (
              <StepTechStack
                value={data.techStack}
                onBack={handleBack}
                onSelect={(techStack) => handleFinish({ techStack })}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}