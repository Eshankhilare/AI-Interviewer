import { describe, expect, it } from 'vitest'
import { buildPracticeCalendar, buildReminderEmail } from './reminders'
describe('practice calendar', () => {
  it('writes one event per due question', () => {
    const ics = buildPracticeCalendar([
      { key: '4:1', interviewId: 4, order: 1, question: 'Explain replication', dueAt: '2026-10-29T09:00:00.000Z', score: 40, sourceTitle: 'Backend' },
      { key: '4:2', interviewId: 4, order: 2, question: 'Explain caching', dueAt: '2026-10-30T09:00:00.000Z', score: 70 },
    ], new Date('2026-10-27T12:00:00.000Z'))

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('SUMMARY:Practice: Explain replication')
    expect(ics).toContain('DTSTART:20261029T090000Z')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('skips items without a valid due date', () => {
    const ics = buildPracticeCalendar([{ question: 'Broken', dueAt: 'nope' }])
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('escapes commas, semicolons and newlines', () => {
    const ics = buildPracticeCalendar([{
      question: 'One, two; three\nfour',
      dueAt: '2026-10-29T09:00:00.000Z',
    }])
    expect(ics).toContain('SUMMARY:Practice: One\\, two\\; three\\nfour')
  })

  it('builds an email with every due question and the queue link', () => {
    const mail = buildReminderEmail([
      { question: 'Explain replication', dueAt: '2026-10-29T09:00:00.000Z' },
      { question: 'Explain caching', dueAt: '2026-10-30T09:00:00.000Z' },
    ], { appUrl: 'http://localhost:5173' })

    expect(mail.subject).toContain('2 questions')
    expect(mail.body).toContain('Explain replication')
    expect(mail.body).toContain('http://localhost:5173/practice')
  })
})
