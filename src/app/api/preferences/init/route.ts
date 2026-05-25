import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateProfile } from '@/lib/profile'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const error = validateProfile({
    role: body.role,
    experienceLevel: body.experienceLevel,
    interests: body.interests || [],
    techStack: body.techStack || [],
    goals: body.goals || [],
    preferredLanguages: body.preferredLanguages || [],
  })
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  let prefs = await prisma.userPreference.findFirst()
  if (!prefs) {
    prefs = await prisma.userPreference.create({
      data: { preferredLanguages: '[]', notifyEnabled: false, notifyInterval: 60 },
    })
  }

  const updated = await prisma.userPreference.update({
    where: { id: prefs.id },
    data: {
      onboardingCompleted: true,
      role: body.role || prefs.role,
      experienceLevel: body.experienceLevel || prefs.experienceLevel,
      interests: body.interests ? JSON.stringify(body.interests) : prefs.interests,
      techStack: body.techStack ? JSON.stringify(body.techStack) : prefs.techStack,
      goals: body.goals ? JSON.stringify(body.goals) : prefs.goals,
      preferredLanguages: body.preferredLanguages ? JSON.stringify(body.preferredLanguages) : prefs.preferredLanguages,
    },
  })

  return NextResponse.json({
    preferredLanguages: JSON.parse(updated.preferredLanguages),
    notifyEnabled: updated.notifyEnabled,
    notifyInterval: updated.notifyInterval,
    onboardingCompleted: updated.onboardingCompleted,
    role: updated.role,
    experienceLevel: updated.experienceLevel,
    interests: JSON.parse(updated.interests),
    techStack: JSON.parse(updated.techStack),
    goals: JSON.parse(updated.goals),
  })
}