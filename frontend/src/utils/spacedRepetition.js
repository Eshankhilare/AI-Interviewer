// Spaced repetition for interview questions, in the spirit of Anki and
// interviewKata's daily drills. The schedule lives in localStorage because the
// review is self-graded: no backend write and no model call. Each item keeps a
// snapshot of the question and its feedback, so a drill works without fetching
// the report again.

const KEY_PREFIX = 'interviewer-practice-v1'
const DAY = 24 * 60 * 60 * 1000
const AGAIN_DELAY = 10 * 60 * 1000

const GRADE_DELTA = { again: -0.2, hard: -0.05, good: 0, easy: 0.15 }

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const scheduleKey = (user) => `${KEY_PREFIX}:${user?.email || user?.id || 'local'}`

export const practiceItemKey = (interviewId, order) => `${interviewId}:${order}`

export const nextState = (item, grade, now = Date.now()) => {
  const ease = clamp((item?.ease ?? 2.5) + (GRADE_DELTA[grade] ?? 0), 1.3, 2.8)
  const reps = (item?.reps ?? 0) + 1
  const previousDays = item?.intervalDays ?? 0

  let intervalDays
  if (grade === 'again') intervalDays = 0
  else if (grade === 'hard') intervalDays = Math.max(1, Math.round(previousDays * 1.2) || 1)
  else if (grade === 'easy') intervalDays = Math.max(4, Math.round((previousDays || 2) * ease * 1.3))
  else intervalDays = reps === 1 ? 2 : Math.max(2, Math.round(previousDays * ease))

  const dueAt = grade === 'again'
    ? now + AGAIN_DELAY
    : now + intervalDays * DAY

  return {
    ...item,
    ease: Math.round(ease * 100) / 100,
    intervalDays,
    reps,
    dueAt: new Date(dueAt).toISOString(),
    lastGrade: grade,
    lastReviewedAt: new Date(now).toISOString(),
  }
}

export const intervalLabel = (item, grade) => {
  const next = nextState(item, grade)
  if (next.intervalDays === 0) return 'in 10 min'
  return next.intervalDays === 1 ? 'in 1 day' : `in ${next.intervalDays} days`
}

const emptySchedule = () => ({ version: 1, items: {} })

export const loadSchedule = (user) => {
  if (typeof localStorage === 'undefined') return emptySchedule()
  try {
    const raw = localStorage.getItem(scheduleKey(user))
    if (!raw) return emptySchedule()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.items !== 'object' || parsed.items === null) return emptySchedule()
    return { version: 1, items: parsed.items }
  } catch {
    return emptySchedule()
  }
}

export const saveSchedule = (user, schedule) => {
  try {
    localStorage.setItem(scheduleKey(user), JSON.stringify(schedule))
    return true
  } catch {
    return false
  }
}

export const addToPractice = (schedule, item, now = Date.now()) => {
  const key = practiceItemKey(item.interviewId, item.order)
  const existing = schedule.items[key]
  const next = existing
    ? { ...existing, ...item, key, updatedAt: new Date(now).toISOString() }
    : {
        ...item,
        key,
        ease: 2.5,
        intervalDays: 0,
        reps: 0,
        dueAt: new Date(now).toISOString(),
        lastGrade: null,
        lastReviewedAt: null,
        addedAt: new Date(now).toISOString(),
      }
  return { ...schedule, items: { ...schedule.items, [key]: next } }
}

export const removeFromPractice = (schedule, key) => {
  const items = { ...schedule.items }
  delete items[key]
  return { ...schedule, items }
}

const byDue = (a, b) => new Date(a.dueAt) - new Date(b.dueAt)

export const dueItems = (schedule, now = Date.now()) => Object.values(schedule.items)
  .filter((item) => new Date(item.dueAt).getTime() <= now)
  .sort(byDue)

export const upcomingItems = (schedule, now = Date.now()) => Object.values(schedule.items)
  .filter((item) => new Date(item.dueAt).getTime() > now)
  .sort(byDue)

export const gradePracticeItem = (schedule, key, grade, now = Date.now()) => {
  const item = schedule.items[key]
  if (!item) return schedule
  return { ...schedule, items: { ...schedule.items, [key]: nextState(item, grade, now) } }
}

// Keeps the due counts in sync while the app is open: another tab changing the
// schedule fires `storage`, and returning to this tab fires `focus`.
export const subscribeSchedule = (callback) => {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (event) => {
    if (!event.key || event.key.startsWith(KEY_PREFIX)) callback()
  }
  const onFocus = () => callback()
  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onFocus)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onFocus)
  }
}

export const exportSchedule = (schedule) => JSON.stringify({
  version: 1,
  exportedAt: new Date().toISOString(),
  items: schedule?.items || {},
}, null, 2)

export const importSchedule = (raw) => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed.items !== 'object' || parsed.items === null) return null
    const items = {}
    for (const [key, item] of Object.entries(parsed.items)) {
      if (!item || typeof item.question !== 'string' || !item.dueAt) continue
      items[key] = item
    }
    return Object.keys(items).length > 0 ? { version: 1, items } : null
  } catch {
    return null
  }
}
