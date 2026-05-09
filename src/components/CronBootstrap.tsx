'use client'
import { useEffect, useRef } from 'react'

export default function CronBootstrap() {
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    fetch('/api/cron/start', { method: 'POST' }).catch(e => console.error('cron start failed:', e))
  }, [])
  return null
}
