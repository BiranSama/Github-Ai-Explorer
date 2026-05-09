import { NextResponse } from 'next/server'
import { syncTrending } from '@/lib/trending'

export async function POST(req: Request) {
  try {
    const { language, since } = await req.json().catch(() => ({}))
    await syncTrending(language, since || 'daily')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
