'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePreferences } from '@/hooks/usePreferences'
import OnboardingWizard from './OnboardingWizard'
import { ROLES, EXPERIENCE_LEVELS, INTEREST_AREAS, TECH_STACK_OPTIONS, GOALS } from '@/lib/interests'

const LANGUAGES = ['TypeScript','JavaScript','Python','Rust','Go','Java','C++','Ruby','Swift','Kotlin']

interface Props { onClose?: () => void }
export default function PreferencesPanel({ onClose }: Props) {
  const { prefs, loading, update, initProfile } = usePreferences()
  const [langs, setLangs] = useState<string[]>([])
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [interval, setInterval_] = useState(60)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    if (prefs) {
      setLangs(prefs.preferredLanguages)
      setNotifyEnabled(prefs.notifyEnabled)
      setInterval_(prefs.notifyInterval)
    }
  }, [prefs])

  function toggleLang(lang: string) {
    setLangs(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await update({ preferredLanguages: langs, notifyEnabled, notifyInterval: interval })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (showWizard) {
    return (
      <OnboardingWizard
        onComplete={async (profile) => {
          await initProfile(profile)
          setShowWizard(false)
        }}
      />
    )
  }

  return (
    <div className="glass rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-lg font-semibold">偏好设置</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2"
          />
          加载中...
        </div>
      ) : (
        <div className="space-y-6">
          {prefs?.onboardingCompleted && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">兴趣画像</span>
                  {prefs.role && (
                    <span className="text-xs text-muted-foreground">
                      {ROLES.find(r => r.value === prefs.role)?.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowWizard(true)}
                  className="text-xs text-primary hover:underline"
                >
                  重新设定
                </button>
              </div>
              {prefs.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prefs.interests.map(i => {
                    const area = INTEREST_AREAS.find(a => a.value === i)
                    return (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                        {area?.emoji} {area?.label || i}
                      </span>
                    )
                  })}
                </div>
              )}
              {prefs.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {prefs.techStack.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-accent">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">偏好语言</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => toggleLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    langs.includes(lang)
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setNotifyEnabled(!notifyEnabled); setSaved(false) }}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifyEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <motion.div
                animate={{ x: notifyEnabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
            <span className="text-sm font-medium">开启推送通知</span>
          </div>

          {notifyEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-muted-foreground">推送间隔（分钟）</label>
              <input
                type="number"
                value={interval}
                min={15}
                max={1440}
                onChange={e => { setInterval_(Number(e.target.value)); setSaved(false) }}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-background border border-input focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
              />
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-500 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已保存
              </motion.span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}