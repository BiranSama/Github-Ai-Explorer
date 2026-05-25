'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import TrendingTab from '@/components/TrendingTab'
import SearchTab from '@/components/SearchTab'
import RecommendTab from '@/components/RecommendTab'
import GraphTab from '@/components/GraphTab'
import HeroSection from '@/components/HeroSection'
import TechStackFooter from '@/components/TechStackFooter'
import DynamicBackground from '@/components/DynamicBackground'
import OnboardingWizard from '@/components/OnboardingWizard'
import { usePreferences } from '@/hooks/usePreferences'

export default function Home() {
  const [tab, setTab] = useState<'trending' | 'search' | 'recommend' | 'graph'>('trending')
  const { prefs, loading, initProfile } = usePreferences()

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!prefs?.onboardingCompleted) {
    return <OnboardingWizard onComplete={async (profile) => {
      await initProfile(profile)
    }} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DynamicBackground />
      <HeroSection />
      <NavBar activeTab={tab} onTabChange={setTab} />
      <main className="container mx-auto py-6 px-4 relative z-10">
        {tab === 'trending' && <TrendingTab />}
        {tab === 'search' && <SearchTab />}
        {tab === 'recommend' && <RecommendTab />}
        {tab === 'graph' && <GraphTab />}
      </main>
      <TechStackFooter />
    </div>
  )
}
