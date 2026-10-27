import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addToPractice,
  dueItems,
  gradePracticeItem,
  intervalLabel,
  loadSchedule,
  practiceItemKey,
  removeFromPractice,
  saveSchedule,
  scheduleKey,
  upcomingItems,
} from './spacedRepetition'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 27, 12, 0, 0)
const user = { email: 'ada@example.com' }

const item = {
  interviewId: 7,
  order: 2,
  question: 'Explain database replication.',
  questionType: 'TECHNICAL',
  score: 40,
  expectedAnswer: 'Synchronous waits for the replica; asynchronous does not.',
  sampleResponse: 'A good answer compares latency and consistency.',
  feedback: 'Missing the trade-off.',
}

describe('spaced repetition', () => {
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    })
  })

  it('stores a question as due immediately', () => {
    const schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    const due = dueItems(schedule, NOW)

    expect(due).toHaveLength(1)
    expect(due[0].key).toBe(practiceItemKey(7, 2))
    expect(due[0].question).toContain('replication')
  })

  it('schedules a good answer two days out, then grows the interval', () => {
    let schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    const key = practiceItemKey(7, 2)
    schedule = gradePracticeItem(schedule, key, 'good', NOW)

    const first = schedule.items[key]
    expect(first.intervalDays).toBe(2)
    expect(dueItems(schedule, NOW + DAY)).toHaveLength(0)
    expect(dueItems(schedule, NOW + 2 * DAY + 1)).toHaveLength(1)

    schedule = gradePracticeItem(schedule, key, 'good', NOW + 2 * DAY)
    expect(schedule.items[key].intervalDays).toBeGreaterThanOrEqual(4)
  })

  it('brings an again answer back in ten minutes and lowers ease', () => {
    let schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    const key = practiceItemKey(7, 2)
    schedule = gradePracticeItem(schedule, key, 'again', NOW)

    expect(schedule.items[key].intervalDays).toBe(0)
    expect(schedule.items[key].ease).toBeLessThan(2.5)
    expect(dueItems(schedule, NOW + 9 * 60 * 1000)).toHaveLength(0)
    expect(dueItems(schedule, NOW + 11 * 60 * 1000)).toHaveLength(1)
  })

  it('never drops ease below 1.3', () => {
    let schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    const key = practiceItemKey(7, 2)
    for (let i = 0; i < 10; i += 1) schedule = gradePracticeItem(schedule, key, 'again', NOW)
    expect(schedule.items[key].ease).toBe(1.3)
  })

  it('sorts due before upcoming and removes cleanly', () => {
    let schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    schedule = addToPractice(schedule, { ...item, order: 3 }, NOW)
    schedule = gradePracticeItem(schedule, practiceItemKey(7, 3), 'good', NOW)
    schedule = addToPractice(schedule, { ...item, order: 4 }, NOW)

    expect(dueItems(schedule, NOW)).toHaveLength(2)
    expect(upcomingItems(schedule, NOW)).toHaveLength(1)

    schedule = removeFromPractice(schedule, practiceItemKey(7, 2))
    expect(dueItems(schedule, NOW)).toHaveLength(1)
  })

  it('round-trips through localStorage per user', () => {
    let schedule = addToPractice({ version: 1, items: {} }, item, NOW)
    schedule = gradePracticeItem(schedule, practiceItemKey(7, 2), 'good', NOW)
    saveSchedule(user, schedule)

    expect(loadSchedule(user).items[practiceItemKey(7, 2)].intervalDays).toBe(2)
    expect(loadSchedule({ email: 'other@example.com' }).items).toEqual({})
    expect(scheduleKey(user)).toContain('ada@example.com')
  })

  it('labels the next interval for each grade', () => {
    expect(intervalLabel(item, 'again')).toBe('in 10 min')
    expect(intervalLabel(item, 'hard')).toBe('in 1 day')
    expect(intervalLabel(item, 'good')).toBe('in 2 days')
    expect(intervalLabel(item, 'easy')).toMatch(/in \d+ days/)
  })
})
