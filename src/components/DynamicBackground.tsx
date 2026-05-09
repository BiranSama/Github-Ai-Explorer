'use client'

import { useTheme } from './ThemeProvider'

export default function DynamicBackground() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Mesh Gradient Blobs */}
      <div className="absolute inset-0">
        <div
          className={`absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30 animate-blob ${
            isDark ? 'bg-purple-600' : 'bg-indigo-400'
          }`}
          style={{ top: '-10%', left: '-10%', animationDelay: '0s' }}
        />
        <div
          className={`absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-blob ${
            isDark ? 'bg-blue-600' : 'bg-violet-400'
          }`}
          style={{ bottom: '-5%', right: '-5%', animationDelay: '2s' }}
        />
        <div
          className={`absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-20 animate-blob ${
            isDark ? 'bg-cyan-600' : 'bg-blue-300'
          }`}
          style={{ top: '40%', left: '50%', animationDelay: '4s' }}
        />
      </div>

      {/* Noise Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}
