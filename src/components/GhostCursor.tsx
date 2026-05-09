'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export default function GhostCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)
    }
    resize()

    const isDark = document.documentElement.classList.contains('dark')
    const hue = isDark ? 270 : 240  // purple in dark, indigo in light

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      mouseRef.current.prevX = mouseRef.current.x
      mouseRef.current.prevY = mouseRef.current.y
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top

      // Spawn particles
      const dx = mouseRef.current.x - mouseRef.current.prevX
      const dy = mouseRef.current.y - mouseRef.current.prevY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.min(Math.floor(dist / 3), 5)

      for (let i = 0; i < steps; i++) {
        const t = i / steps
        particlesRef.current.push({
          x: mouseRef.current.prevX + dx * t,
          y: mouseRef.current.prevY + dy * t,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          life: 1,
          maxLife: 40 + Math.random() * 30,
          size: 2 + Math.random() * 4,
        })
      }
    }

    parent.addEventListener('mousemove', handleMove)

    const animate = () => {
      const rect = parent.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= 1 / p.maxLife
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.98
        p.vy *= 0.98

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const alpha = p.life * p.life * (isDark ? 0.6 : 0.4)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${alpha})`)
        gradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Draw glow around current mouse
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      if (mx > 0 || my > 0) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 60)
        glow.addColorStop(0, `hsla(${hue}, 80%, 70%, ${isDark ? 0.15 : 0.08})`)
        glow.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`)
        ctx.fillStyle = glow
        ctx.fillRect(mx - 60, my - 60, 120, 120)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      parent.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
