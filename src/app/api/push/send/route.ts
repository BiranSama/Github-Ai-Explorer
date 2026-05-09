import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPushNotification } from '@/lib/webpush'

export async function POST(req: Request) {
  try {
    const { projectId, title, body } = await req.json().catch(() => ({}))
    const prefs = await prisma.userPreference.findFirst()
    if (!prefs?.pushSubscription) return NextResponse.json({ error: 'no subscription' }, { status: 400 })

    await sendPushNotification(prefs.pushSubscription, {
      title: title || '📈 GitHub 热门推荐',
      body: body || '',
      url: projectId ? `https://github.com/${projectId}` : undefined,
    })

    if (projectId) {
      await prisma.pushLog.create({ data: { projectId, pushedAt: new Date() } })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
