import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function getOrCreate() {
  let prefs = await prisma.userPreference.findFirst()
  if (!prefs) {
    prefs = await prisma.userPreference.create({
      data: { preferredLanguages: '[]', notifyEnabled: false, notifyInterval: 60 },
    })
  }
  return prefs
}

export async function GET() {
  const prefs = await getOrCreate()
  return NextResponse.json({
    preferredLanguages: JSON.parse(prefs.preferredLanguages),
    notifyEnabled: prefs.notifyEnabled,
    notifyInterval: prefs.notifyInterval,
  })
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}))
  const prefs = await getOrCreate()
  const updated = await prisma.userPreference.update({
    where: { id: prefs.id },
    data: {
      preferredLanguages: body.preferredLanguages ? JSON.stringify(body.preferredLanguages) : prefs.preferredLanguages,
      notifyEnabled: body.notifyEnabled ?? prefs.notifyEnabled,
      notifyInterval: body.notifyInterval ?? prefs.notifyInterval,
    },
  })
  return NextResponse.json({
    preferredLanguages: JSON.parse(updated.preferredLanguages),
    notifyEnabled: updated.notifyEnabled,
    notifyInterval: updated.notifyInterval,
  })
}
