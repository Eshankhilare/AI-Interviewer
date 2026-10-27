// Habit signals computed from the interviews the app already returns. No new
// endpoint: a streak is the run of consecutive local days with any session.

const dayKey = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const shiftDay = (key, days) => {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day + days)
  return dayKey(date)
}

export const activeDays = (interviews) => {
  const days = new Set()
  for (const interview of interviews || []) {
    const key = dayKey(interview?.createdAt)
    if (key) days.add(key)
  }
  return days
}

export const currentStreak = (interviews, now = new Date()) => {
  const days = activeDays(interviews)
  let cursor = dayKey(now)
  if (!days.has(cursor)) {
    cursor = shiftDay(cursor, -1)
    if (!days.has(cursor)) return 0
  }
  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

export const sessionsThisWeek = (interviews, now = new Date()) => {
  const end = new Date(now)
  const start = new Date(now)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return (interviews || []).filter((interview) => {
    const date = new Date(interview?.createdAt)
    return !Number.isNaN(date.getTime()) && date >= start && date <= end
  }).length
}
