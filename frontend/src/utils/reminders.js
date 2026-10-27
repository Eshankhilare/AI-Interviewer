// Calendar reminders for the practice queue. No SMTP or third-party calendar
// scope: an .ics file the user imports once, with one event per due question.

const pad = (value) => String(value).padStart(2, '0')

const stamp = (date) => (
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T`
  + `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
)

const escapeText = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n')

export function buildPracticeCalendar(items = [], now = new Date()) {  const events = items.map((item) => {
    const start = new Date(item.dueAt)
    if (Number.isNaN(start.getTime())) return ''
    const end = new Date(start.getTime() + 15 * 60 * 1000)
    return [
      'BEGIN:VEVENT',
      `UID:${escapeText(item.key || `${item.interviewId}-${item.order}`)}@ai-interviewer`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeText(`Practice: ${item.question || 'interview question'}`)}`,
      `DESCRIPTION:${escapeText(`${item.sourceTitle || 'Interview'} · last score ${item.score ?? 'n/a'}/100`)}`,
      'END:VEVENT',
    ].join('\r\n')
  }).filter(Boolean)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Interviewer//Practice queue//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function buildReminderEmail(items = [], { appUrl = '' } = {}) {
  const lines = items
    .filter((item) => item?.question)
    .map((item) => {
      const date = new Date(item.dueAt)
      const due = Number.isNaN(date.getTime()) ? 'soon' : date.toLocaleDateString()
      return `- ${item.question} (due ${due})`
    })

  return {
    subject: `Practice queue: ${lines.length} question${lines.length === 1 ? '' : 's'} scheduled`,
    body: [
      'Your practice plan',
      '',
      ...lines,
      '',
      appUrl ? `Open the queue: ${appUrl}/practice` : 'Open the practice queue in AI Interviewer.',
      '',
      'Self-graded, spaced repetition. Keep each answer under two minutes.',
    ].join('\n'),
  }
}
