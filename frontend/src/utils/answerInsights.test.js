import { describe, expect, it } from 'vitest'
import { analyzeAnswer } from './answerInsights'
describe('analyzeAnswer', () => {
  it('counts fillers, words and result language', () => {
    const insights = analyzeAnswer({
      text: 'Um, I built the cache, you know, and it reduced latency by 40 percent. Basically it was fine.',
    })

    expect(insights.words).toBeGreaterThan(10)
    expect(insights.fillerItems.map((f) => f.word)).toEqual(expect.arrayContaining(['um', 'you know', 'basically']))
    expect(insights.fillerRate).toBeGreaterThan(0)
    expect(insights.talkingPoints.find((p) => p.key === 'results').hit).toBe(true)
  })

  it('surfaces words repeated three or more times and skips stopwords', () => {
    const insights = analyzeAnswer({ text: 'cache cache cache latency latency latency redis the the the' })

    expect(insights.topWords).toEqual([
      { word: 'cache', count: 3 },
      { word: 'latency', count: 3 },
    ])
    expect(insights.topWords.find((w) => w.word === 'the')).toBeUndefined()
  })

  it('detects all four STAR parts in a behavioural answer', () => {
    const insights = analyzeAnswer({
      text: 'When I joined the team, my task was to reduce latency. I built a new cache and reduced p99 by 40%.',
      behavioral: true,
    })

    expect(insights.star.filter((part) => part.hit)).toHaveLength(4)
  })

  it('computes pace only when a duration is supplied', () => {
    const text = Array.from({ length: 120 }, () => 'answer').join(' ')
    const insights = analyzeAnswer({ text, seconds: 60 })

    expect(insights.pace.wpm).toBe(120)
    expect(insights.pace.tone).toBe('good')
    expect(analyzeAnswer({ text }).pace).toBeNull()
  })

  it('returns empty metrics for an empty answer', () => {
    const insights = analyzeAnswer({ text: '' })

    expect(insights.words).toBe(0)
    expect(insights.topWords).toEqual([])
    expect(insights.fillerCount).toBe(0)
  })

  it('flags weak words and long sentences', () => {
    const longSentence = Array.from({ length: 30 }, () => 'word').join(' ')
    const insights = analyzeAnswer({ text: `This is very really just stuff. ${longSentence}.` })

    expect(insights.weakCount).toBeGreaterThanOrEqual(3)
    expect(insights.longSentences).toBe(1)
  })
})
