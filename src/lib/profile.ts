import {
  VALID_ROLES,
  VALID_EXPERIENCE_LEVELS,
  VALID_INTERESTS,
  VALID_GOALS,
} from './interests'

export interface UserProfile {
  onboardingCompleted: boolean
  role: string | null
  experienceLevel: string | null
  interests: string[]
  techStack: string[]
  goals: string[]
  preferredLanguages: string[]
  notifyEnabled: boolean
  notifyInterval: number
}

export interface InitProfileInput {
  role: string
  experienceLevel?: string
  interests: string[]
  techStack?: string[]
  goals?: string[]
  preferredLanguages?: string[]
}

export function validateProfile(input: InitProfileInput): string | null {
  if (!VALID_ROLES.includes(input.role as typeof VALID_ROLES[number])) {
    return `Invalid role: ${input.role}`
  }
  if (input.experienceLevel && !VALID_EXPERIENCE_LEVELS.includes(input.experienceLevel as typeof VALID_EXPERIENCE_LEVELS[number])) {
    return `Invalid experienceLevel: ${input.experienceLevel}`
  }
  if (input.interests && input.interests.length > 0) {
    const invalid = input.interests.filter(i => !VALID_INTERESTS.includes(i as typeof VALID_INTERESTS[number]))
    if (invalid.length > 0) return `Invalid interests: ${invalid.join(', ')}`
  }
  if (input.goals && input.goals.length > 0) {
    const invalid = input.goals.filter(g => !VALID_GOALS.includes(g as typeof VALID_GOALS[number]))
    if (invalid.length > 0) return `Invalid goals: ${invalid.join(', ')}`
  }
  return null
}