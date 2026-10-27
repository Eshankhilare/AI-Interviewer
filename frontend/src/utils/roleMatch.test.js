import { describe, expect, it } from 'vitest'
import { analyzeRoleFit, extractKeywords, resumeTextFrom } from './roleMatch'

describe('roleMatch', () => {
  it('scores keyword overlap and lists what the resume never mentions', () => {
    const fit = analyzeRoleFit({
      jobDescription: 'Java Spring Boot SQL Kafka Kubernetes REST APIs',
      resumeText: 'Java Spring Boot SQL REST APIs',
    })

    expect(fit.score).toBeGreaterThan(0)
    expect(fit.score).toBeLessThanOrEqual(100)
    expect(fit.matched).toEqual(expect.arrayContaining(['java', 'spring']))
    expect(fit.missing).toEqual(expect.arrayContaining(['kafka', 'kubernetes']))
  })

  it('drops job-posting boilerplate from the keyword list', () => {
    const keywords = extractKeywords('Experience with Java. Strong team player, ability to work in a team.', 10)

    expect(keywords).toContain('java')
    expect(keywords).not.toContain('experience')
    expect(keywords).not.toContain('team')
  })

  it('flattens parsed resume skills and summary', () => {
    const text = resumeTextFrom(JSON.stringify({
      summary: 'Backend engineer',
      skills: { programming_languages: ['Java'], databases: ['PostgreSQL'] },
    }))

    expect(text).toContain('Backend engineer')
    expect(text).toContain('Java')
    expect(text).toContain('PostgreSQL')
  })
})
