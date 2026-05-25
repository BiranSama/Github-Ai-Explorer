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

function formatPrefs(prefs: Awaited<ReturnType<typeof getOrCreate>>) {
  return {
    preferredLanguages: JSON.parse(prefs.preferredLanguages),
    notifyEnabled: prefs.notifyEnabled,
    notifyInterval: prefs.notifyInterval,
    onboardingCompleted: prefs.onboardingCompleted,
    role: prefs.role,
    experienceLevel: prefs.experienceLevel,
    interests: JSON.parse(prefs.interests),
    techStack: JSON.parse(prefs.techStack),
    goals: JSON.parse(prefs.goals),
  }
}

export async function GET() {
  const prefs = await getOrCreate()
  return NextResponse.json(formatPrefs(prefs))
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
      role: body.role !== undefined ? body.role : prefs.role,
      experienceLevel: body.experienceLevel !== undefined ? body.experienceLevel : prefs.experienceLevel,
      interests: body.interests ? JSON.stringify(body.interests) : prefs.interests,
      techStack: body.techStack ? JSON.stringify(body.techStack) : prefs.techStack,
      goals: body.goals ? JSON.stringify(body.goals) : prefs.goals,
    },
  })
  return NextResponse.json(formatPrefs(updated))
}
