import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import CronBootstrap from '@/components/CronBootstrap'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'GitHub AI Explorer',
  description: 'Discover trending GitHub projects with AI-powered insights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <CronBootstrap />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  )
}
