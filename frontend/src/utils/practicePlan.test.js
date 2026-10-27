import { describe, expect, it } from 'vitest'
import { buildPracticePlan } from './practicePlan'

describe('buildPracticePlan', () => {
  it('builds three steps from the weakest question and skills', () => {
    const steps = buildPracticePlan({
      radar: [
        { skill: 'Relevance', score: 20 },
        { skill: 'Clarity', score: 80 },
      ],
      breakdown: [
        { questionOrder: 2, score: 30, improvementSuggestions: '["Be specific about the mechanism"]' },
        { questionOrder: 1, score: 70 },
      ],
    })

    expect(steps).toHaveLength(3)
    expect(steps[0].title).toContain('Q2')
    expect(steps[0].title).toContain('30/100')
    expect(steps[0].detail).toBe('Be specific about the mechanism')
    expect(steps[1].title).toContain('Relevance')
    expect(steps[2].title).toBe('Next session')
  })

  it('returns nothing when there is no scored data', () => {
    expect(buildPracticePlan({})).toEqual([])
    expect(buildPracticePlan({ radar: [], breakdown: [] })).toEqual([])
  })
})
