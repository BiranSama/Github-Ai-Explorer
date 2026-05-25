import { describe, it, expect } from 'vitest'
import {
  ROLES,
  EXPERIENCE_LEVELS,
  INTEREST_AREAS,
  TECH_STACK_OPTIONS,
  GOALS,
  TECH_RELATED,
  VALID_ROLES,
  VALID_EXPERIENCE_LEVELS,
  VALID_INTERESTS,
  VALID_GOALS,
  matchInterests,
  getRelatedTech,
} from '@/lib/interests'

describe('interests constants', () => {
  it('has 8 roles', () => {
    expect(ROLES).toHaveLength(8)
  })

  it('has 4 experience levels', () => {
    expect(EXPERIENCE_LEVELS).toHaveLength(4)
  })

  it('has 12 interest areas', () => {
    expect(INTEREST_AREAS).toHaveLength(12)
  })

  it('has 14 tech stack options', () => {
    expect(TECH_STACK_OPTIONS).toHaveLength(14)
  })

  it('has 6 goals', () => {
    expect(GOALS).toHaveLength(6)
  })

  it('each role has value, label, emoji', () => {
    for (const role of ROLES) {
      expect(role.value).toBeTruthy()
      expect(role.label).toBeTruthy()
      expect(role.emoji).toBeTruthy()
    }
  })

  it('each interest has value, label, emoji, keywords', () => {
    for (const area of INTEREST_AREAS) {
      expect(area.value).toBeTruthy()
      expect(area.label).toBeTruthy()
      expect(area.emoji).toBeTruthy()
      expect(area.keywords.length).toBeGreaterThan(0)
    }
  })

  it('VALID_ROLES matches ROLES values', () => {
    expect(VALID_ROLES).toEqual(ROLES.map(r => r.value))
  })

  it('VALID_INTERESTS matches INTEREST_AREAS values', () => {
    expect(VALID_INTERESTS).toEqual(INTEREST_AREAS.map(a => a.value))
  })

  it('VALID_GOALS matches GOALS values', () => {
    expect(VALID_GOALS).toEqual(GOALS.map(g => g.value))
  })
})

describe('matchInterests', () => {
  it('returns empty array when no user interests', () => {
    const result = matchInterests('A React project', [], [])
    expect(result).toEqual([])
  })

  it('matches interest based on project description keywords', () => {
    const result = matchInterests('A modern React framework for building web apps', [], ['web-dev', 'ai-ml'])
    expect(result).toContain('web-dev')
    expect(result).not.toContain('ai-ml')
  })

  it('matches interest based on project topics', () => {
    const result = matchInterests(null, ['react', 'nextjs'], ['web-dev', 'cli-tools'])
    expect(result).toContain('web-dev')
    expect(result).not.toContain('cli-tools')
  })

  it('matches multiple interests', () => {
    const result = matchInterests(
      'A CLI tool for managing Docker containers and Kubernetes',
      [],
      ['cli-tools', 'devops-infra']
    )
    expect(result).toContain('cli-tools')
    expect(result).toContain('devops-infra')
  })

  it('handles null description', () => {
    const result = matchInterests(null, [], ['web-dev'])
    expect(result).toEqual([])
  })

  it('handles empty string description', () => {
    const result = matchInterests('', [], ['web-dev'])
    expect(result).toEqual([])
  })
})

describe('getRelatedTech', () => {
  it('returns related tech for known tech', () => {
    const result = getRelatedTech(['react'])
    expect(result).toContain('next.js')
    expect(result).toContain('vite')
  })

  it('returns empty array for unknown tech', () => {
    const result = getRelatedTech(['unknown-tech'])
    expect(result).toEqual([])
  })

  it('deduplicates related tech', () => {
    const result = getRelatedTech(['react', 'vue'])
    const unique = new Set(result)
    expect(result.length).toBe(unique.size)
  })

  it('combines related tech from multiple inputs', () => {
    const result = getRelatedTech(['react', 'python'])
    expect(result).toContain('next.js')
    expect(result).toContain('django')
  })
})

describe('TECH_RELATED', () => {
  it('every tech stack option has an entry or is expected', () => {
    for (const tech of TECH_STACK_OPTIONS) {
      if (tech in TECH_RELATED) {
        expect(TECH_RELATED[tech].length).toBeGreaterThan(0)
      }
    }
  })
})