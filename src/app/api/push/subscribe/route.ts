import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { subscription } = await req.json().catch(() => ({}))
  if (!subscription) return NextResponse.json({ error: 'missing subscription' }, { status: 400 })
  let prefs = await prisma.userPreference.findFirst()
  if (!prefs) {
    prefs = await prisma.userPreference.create({ data: { preferredLanguages: '[]', notifyEnabled: true, notifyInterval: 60 } })
  }
  await prisma.userPreference.update({
    where: { id: prefs.id },
    data: { pushSubscription: JSON.stringify(subscription), notifyEnabled: true },
  })
  return NextResponse.json({ ok: true })
}
