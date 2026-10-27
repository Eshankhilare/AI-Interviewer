// Deterministic answer insights, inspired by Google Interview Warmup (most-used
// words, talking points) and Yoodli (filler rate, pace). No model call, so the
// numbers cannot be invented — they are counts over the candidate's own words.
//
// shortcut: English keyword heuristics, not NLP. Fillers are the conservative
// set (omits "like"/"right", which are ambiguous in technical answers). Upgrade
// to a token classifier only if users report false positives.

const FILLERS = [
  'um', 'uh', 'erm', 'you know', 'i mean', 'sort of', 'kind of',
  'basically', 'literally', 'actually', 'honestly',
]

const STOPWORDS = new Set(`
a an the and or but if then than that this these those it its it's i i'm i've i'd
we we're we've you you're he she they them their our your my me us
is are was were be been being have has had do does did done
to of in on at for with from by as about into over after before between
so just very really quite also too much many more most some any all
can could should would will shall may might must
not no nor only own same such
what which who whom when where why how
there here
`.split(/\s+/).filter(Boolean))

const TALKING_POINTS = [
  { key: 'experience', label: 'Experience', re: /\b(experience|worked|working|role|project|team|years|company|production)\b/i },
  { key: 'skills', label: 'Skills', re: /\b(skill|built|implemented|designed|developed|used|learned|technolog|framework|language|system)\b/i },
  { key: 'results', label: 'Results', re: /\b(result|reduced|increased|improved|saved|delivered|impact|latency|throughput|revenue|churn|\d+\s?%)\b/i },
  { key: 'lessons', label: 'Lessons learned', re: /\b(learned|lesson|mistake|realized|next time|would do differently|takeaway)\b/i },
  { key: 'goals', label: 'Goals', re: /\b(goal|aim|plan to|want to|motivat|career|growth|next step)\b/i },
]

const STAR = [
  { key: 'situation', label: 'Situation', re: /\b(when i|at my|during|last (year|month|quarter)|we were|the team was|project|incident)\b/i },
  { key: 'task', label: 'Task', re: /\b(my (task|job|role)|responsible|needed to|had to|goal was|asked to|own(ed)?)\b/i },
  { key: 'action', label: 'Action', re: /\b(i (built|led|wrote|implemented|designed|migrated|fixed|decided|proposed|created|refactored|introduced)|we (built|decided|migrated|implemented|introduced))\b/i },
  { key: 'result', label: 'Result', re: /\b(result|reduced|increased|improved|saved|delivered|latency|throughput|revenue|churn|by \d+\s?%|\d+\s?%)\b/i },
]

const tokens = (text) => (text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || [])

const countPhrase = (text, phrase) => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = text.match(new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'gi'))
  return matches ? matches.length : 0
}

const paceBand = (wpm) => {
  if (wpm < 110) return { label: 'slow', tone: 'warn' }
  if (wpm > 180) return { label: 'fast', tone: 'warn' }
  return { label: 'in range', tone: 'good' }
}

export function analyzeAnswer({ text = '', seconds = null, behavioral = false } = {}) {
  const clean = String(text || '').trim()
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0

  const lower = clean.toLowerCase()
  const fillerItems = FILLERS
    .map((word) => ({ word, count: countPhrase(lower, word) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
  const fillerCount = fillerItems.reduce((sum, item) => sum + item.count, 0)
  const fillerRate = words > 0 ? Math.round((fillerCount / words) * 1000) / 10 : 0

  const counts = new Map()
  for (const token of tokens(clean)) {
    if (STOPWORDS.has(token)) continue
    counts.set(token, (counts.get(token) || 0) + 1)
  }
  const topWords = [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }))

  const sentences = clean ? clean.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean).length : 0
  const avgSentenceWords = sentences > 0 ? Math.round(words / sentences) : 0

  const talkingPoints = TALKING_POINTS.map(({ key, label, re }) => ({
    key, label, hit: re.test(clean),
  }))

  const star = behavioral
    ? STAR.map(({ key, label, re }) => ({ key, label, hit: re.test(clean) }))
    : null

  const pace = seconds && seconds > 0 && words > 0
    ? { wpm: Math.round((words / seconds) * 60), ...paceBand(Math.round((words / seconds) * 60)) }
    : null

  return { words, sentences, avgSentenceWords, fillerCount, fillerRate, fillerItems, topWords, talkingPoints, star, pace }
}

export { FILLERS, STOPWORDS }
