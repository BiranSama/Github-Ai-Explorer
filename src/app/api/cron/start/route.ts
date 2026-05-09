import { NextResponse } from 'next/server'
import { start } from '@/lib/cron'

let started = false
export async function POST() {
  if (started) return NextResponse.json({ ok: true })
  start()
  started = true
  return NextResponse.json({ ok: true })
}