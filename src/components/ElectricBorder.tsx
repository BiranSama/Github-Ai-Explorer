'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  color?: string
  speed?: number
  chaos?: number
  borderRadius?: number
  active?: boolean
}

export default function ElectricBorder({
  children,
  className = '',
  color,
  speed = 2,
  chaos = 0.5,
  borderRadius = 12,
  active = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = document.documentElement.classList.contains('dark')
    const baseColor = color || (isDark ? '#a855f7' : '#6366f1')

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const offset = 8
      canvas.width = (rect.width + offset * 2) * dpr
      canvas.height = (rect.height + offset * 2) * dpr
      canvas.style.width = `${rect.width + offset * 2}px`
      canvas.style.height = `${rect.height + offset * 2}px`
      canvas.style.left = `${-offset}px`
      canvas.style.top = `${-offset}px`
      ctx.scale(dpr, dpr)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let time = 0
    const draw = () => {
      const rect = container.getBoundingClientRect()
      const offset = 8
      const w = rect.width + offset * 2
      const h = rect.height + offset * 2
      ctx.clearRect(0, 0, w, h)

      const left = offset
      const top = offset
      const rw = rect.width
      const rh = rect.height
      const r = Math.min(borderRadius, rw / 2, rh / 2)

      // Simple electric line animation
      ctx.strokeStyle = baseColor
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const segments = Math.floor((rw + rh) * 2 / 4)
      ctx.beginPath()

      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        let x: number, y: number

        // Parameterize around rectangle
        const perimeter = 2 * (rw + rh - 4 * r) + 2 * Math.PI * r
        const dist = t * perimeter

        // Simplified: just offset from edges
        if (t < 0.25) {
          x = left + r + (rw - 2 * r) * (t / 0.25)
          y = top
        } else if (t < 0.5) {
          x = left + rw
          y = top + r + (rh - 2 * r) * ((t - 0.25) / 0.25)
        } else if (t < 0.75) {
          x = left + rw - r - (rw - 2 * r) * ((t - 0.5) / 0.25)
          y = top + rh
        } else {
          x = left
          y = top + rh - r - (rh - 2 * r) * ((t - 0.75) / 0.25)
        }

        // Add noise
        const noise = Math.sin(t * 20 + time * speed) * chaos * 3 +
                     Math.sin(t * 40 - time * speed * 1.5) * chaos * 1.5
        x += noise
        y += noise

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      // Glow layers
      ctx.shadowColor = baseColor
      ctx.shadowBlur = 4
      ctx.stroke()

      ctx.shadowBlur = 12
      ctx.globalAlpha = 0.4
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      time += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, color, speed, chaos, borderRadius])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {active && (
        <canvas
          ref={canvasRef}
          className="absolute pointer-events-none z-10"
          style={{ width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', left: -8, top: -8 }}
        />
      )}
      {children}
    </div>
  )
}
