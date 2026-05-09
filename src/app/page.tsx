'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import TrendingTab from '@/components/TrendingTab'
import SearchTab from '@/components/SearchTab'
import RecommendTab from '@/components/RecommendTab'
import HeroSection from '@/components/HeroSection'
import TechStackFooter from '@/components/TechStackFooter'
import DynamicBackground from '@/components/DynamicBackground'
import { usePreferences } from '@/hooks/usePreferences'

export default function Home() {
  const [tab, setTab] = useState<'trending' | 'search' | 'recommend'>('trending')
  const { prefs } = usePreferences()

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DynamicBackground />
      <HeroSection />
      <NavBar activeTab={tab} onTabChange={setTab} />
      <main className="container mx-auto py-6 px-4 relative z-10">
        {tab === 'trending' && <TrendingTab />}
        {tab === 'search' && <SearchTab />}
        {tab === 'recommend' && <RecommendTab preferredLanguages={prefs?.preferredLanguages || []} />}
      </main>
      <TechStackFooter />
    </div>
  )
}
