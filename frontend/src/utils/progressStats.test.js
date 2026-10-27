import { describe, expect, it } from 'vitest'
import { currentStreak, sessionsThisWeek } from './progressStats'

const at = (daysAgo, hour = 10) => {
  const date = new Date(2026, 9, 27, hour, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const session = (daysAgo, hour = 10) => ({ createdAt: at(daysAgo, hour) })

describe('progress stats', () => {
  it('counts a streak that ends today', () => {
    const interviews = [session(0), session(1), session(2), session(4)]
    expect(currentStreak(interviews, new Date(2026, 9, 27, 18))).toBe(3)
  })

  it('keeps a streak alive when the last session was yesterday', () => {
    const interviews = [session(1), session(2), session(3)]
    expect(currentStreak(interviews, new Date(2026, 9, 27, 9))).toBe(3)
  })

  it('breaks the streak after a missed day', () => {
    expect(currentStreak([session(2), session(3)], new Date(2026, 9, 27, 9))).toBe(0)
  })

  it('counts sessions in the last seven days', () => {
    const interviews = [session(0), session(3), session(6), session(8)]
    expect(sessionsThisWeek(interviews, new Date(2026, 9, 27, 18))).toBe(3)
  })

  it('ignores missing or invalid dates', () => {
    expect(currentStreak([{}, { createdAt: 'nope' }], new Date(2026, 9, 27))).toBe(0)
    expect(sessionsThisWeek([{}, null], new Date(2026, 9, 27))).toBe(0)
  })
})
