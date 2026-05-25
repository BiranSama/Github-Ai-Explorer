import { describe, it, expect } from 'vitest'
import { validateProfile } from '@/lib/profile'

describe('validateProfile', () => {
  it('accepts valid profile input', () => {
    const result = validateProfile({
      role: 'fullstack',
      interests: ['web-dev', 'ai-ml'],
      techStack: ['react', 'node'],
      goals: ['learn-new-framework'],
    })
    expect(result).toBeNull()
  })

  it('accepts minimal input (role only)', () => {
    const result = validateProfile({
      role: 'frontend',
      interests: [],
    })
    expect(result).toBeNull()
  })

  it('rejects invalid role', () => {
    const result = validateProfile({
      role: 'superhero',
      interests: [],
    })
    expect(result).toContain('Invalid role')
  })

  it('rejects invalid experienceLevel', () => {
    const result = validateProfile({
      role: 'frontend',
      experienceLevel: 'expert',
      interests: [],
    })
    expect(result).toContain('Invalid experienceLevel')
  })

  it('rejects invalid interests', () => {
    const result = validateProfile({
      role: 'frontend',
      interests: ['web-dev', 'invalid-interest'],
    })
    expect(result).toContain('Invalid interests')
  })

  it('rejects invalid goals', () => {
    const result = validateProfile({
      role: 'frontend',
      interests: [],
      goals: ['become-rich'],
    })
    expect(result).toContain('Invalid goals')
  })

  it('accepts all valid roles', () => {
    const roles = ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'student', 'other']
    for (const role of roles) {
      const result = validateProfile({ role, interests: [] })
      expect(result).toBeNull()
    }
  })
})