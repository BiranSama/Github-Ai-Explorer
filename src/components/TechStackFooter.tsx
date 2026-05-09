'use client'

import { useRef, useEffect, useState, memo } from 'react'
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiPrisma, SiSqlite, SiOpenai } from 'react-icons/si'

const techs = [
  { icon: SiTypescript, name: 'TypeScript', color: '#3178C6' },
  { icon: SiReact, name: 'React', color: '#61DAFB' },
  { icon: SiNextdotjs, name: 'Next.js', color: '#000000' },
  { icon: SiTailwindcss, name: 'Tailwind', color: '#06B6D4' },
  { icon: SiPrisma, name: 'Prisma', color: '#2D3748' },
  { icon: SiSqlite, name: 'SQLite', color: '#003B57' },
  { icon: SiOpenai, name: 'OpenAI', color: '#412991' },
]

const TechStackFooter = memo(function TechStackFooter() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const velocityRef = useRef(60)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let lastTime = performance.now()

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const target = isHovered ? 10 : 60
      velocityRef.current += (target - velocityRef.current) * 0.05

      offsetRef.current += velocityRef.current * dt

      const firstChild = track.firstElementChild as HTMLElement
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth
        if (offsetRef.current >= itemWidth) {
          offsetRef.current -= itemWidth
          track.appendChild(track.firstElementChild!)
        }
      }

      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isHovered])

  return (
    <footer className="relative py-8 mt-12 border-t overflow-hidden">
      <p className="text-center text-xs text-muted-foreground mb-4">Built with</p>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div ref={trackRef} className="flex items-center gap-12 w-max will-change-transform">
            {[...techs, ...techs, ...techs].map((tech, i) => {
              const Icon = tech.icon
              return (
                <div
                  key={`${tech.name}-${i}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title={tech.name}
                >
                  <Icon className="w-6 h-6" style={{ color: tech.color }} />
                  <span className="text-sm font-medium">{tech.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
})

export default TechStackFooter
