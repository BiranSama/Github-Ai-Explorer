import { NextResponse } from 'next/server'
import { getTrending } from '@/lib/trending'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const language = searchParams.get('language') || undefined
  const since = searchParams.get('since') || undefined
  const projects = await getTrending(language, since)
  return NextResponse.json(projects)
}
