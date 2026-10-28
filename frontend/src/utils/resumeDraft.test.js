import { describe, expect, it } from 'vitest'
import {
  buildLocalResume, draftToPayload, emptyResumeDraft, mergeGeneratedResume, normalizeSkills, resumeToText,
} from './resumeDraft'

const draft = {
  ...emptyResumeDraft({ fullName: 'Ada Lovelace', email: 'ada@example.com' }),
  role: 'Backend Developer',
  skills: 'Java, Spring Boot, SQL, Java',
  experience: [{
    title: 'Backend Engineer', company: 'Analytical Engines', period: '2023 – 2025',
    description: 'Built REST APIs in Spring Boot. Reduced p95 latency by 40%.',
  }],
  education: [{ degree: 'B.Tech Computer Science', school: 'SCE', period: '2019 – 2023' }],
}

describe('resumeDraft', () => {
  it('deduplicates skills and keeps the candidate facts', () => {
    const resume = buildLocalResume(draft)
    expect(resume.skills).toEqual(['Java', 'Spring Boot', 'SQL'])
    expect(resume.experience[0].company).toBe('Analytical Engines')
    expect(resume.experience[0].bullets).toHaveLength(2)
    expect(resume.mode).toBe('template')
  })

  it('uses only the provided contacts in the text export', () => {
    const text = resumeToText(buildLocalResume(draft), draft)
    expect(text).toContain('Ada Lovelace')
    expect(text).toContain('Backend Developer')
    expect(text).toContain('ada@example.com')
    expect(text).not.toContain('phone')
  })

  it('keeps identity from the form when merging AI prose', () => {
    const local = buildLocalResume(draft)
    const merged = mergeGeneratedResume(local, {
      summary: 'AI summary',
      experience: [{ bullets: ['AI bullet'] }],
      mode: 'ai',
    })
    expect(merged.summary).toBe('AI summary')
    expect(merged.experience[0].company).toBe('Analytical Engines')
    expect(merged.experience[0].bullets).toEqual(['AI bullet'])
    expect(merged.mode).toBe('ai')
  })

  it('maps the form to the API snake_case payload', () => {
    const payload = draftToPayload(draft)
    expect(payload.full_name).toBe('Ada Lovelace')
    expect(payload.role).toBe('Backend Developer')
    expect(payload.experience).toHaveLength(1)
  })

  it('normalizes skill separators', () => {
    expect(normalizeSkills('React; Node.js\nSQL, react')).toEqual(['React', 'Node.js', 'SQL'])
  })
})
