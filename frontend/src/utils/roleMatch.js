// Resume ↔ job-description keyword overlap. This is deliberately a keyword
// check, not a hiring prediction: it shows which terms from the posting the
// resume never mentions. Inspired by Jobscan/Interviewer.AI match scores.

const STOPWORDS = new Set(`
a an the and or but if then than that this these those it its
is are was were be been being have has had do does did done
to of in on at for with from by as about into over after before between
so just very really quite also too much many more most some any all
can could should would will shall may might must
not no nor only own same such
what which who whom when where why how
you your we our us they their he she his her
job role position candidate candidates company companies team teams work working
experience experienced year years ability able strong good great excellent
develop developer developers developing development engineer engineers engineering
build building maintain maintenance
using use used new including include includes etc via across within
required require requirements responsibilities responsibility
`.split(/\s+/).filter(Boolean))

const tokens = (text) => (String(text || '').toLowerCase().match(/[a-z][a-z+#.]*[a-z0-9+#]/g) || []).filter((t) => t.length >= 3)

export function extractKeywords(text, limit = 18) {
  const counts = new Map()
  for (const token of tokens(text)) {
    if (token.length < 3 || STOPWORDS.has(token)) continue
    counts.set(token, (counts.get(token) || 0) + 1)
  }
  const byFrequency = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const seen = new Set()
  const ordered = []
  for (const [word] of byFrequency) {
    const stem = word.replace(/s$/, '')
    if (seen.has(stem)) continue
    seen.add(stem)
    ordered.push(word)
    if (ordered.length >= limit) break
  }
  return ordered
}

export function resumeTextFrom(parsedData) {
  if (!parsedData) return ''
  let parsed = parsedData
  if (typeof parsedData === 'string') {
    try {
      parsed = JSON.parse(parsedData)
    } catch {
      return parsedData
    }
  }
  const skills = Object.values(parsed?.skills || {}).flat().filter(Boolean)
  return [parsed?.summary || '', ...skills].join(' ')
}

export function analyzeRoleFit({ jobDescription = '', resumeText = '', limit = 18 } = {}) {
  const terms = extractKeywords(jobDescription, limit)
  const haystack = ` ${String(resumeText || '').toLowerCase()} `
  const matched = terms.filter((term) => haystack.includes(term))
  const missing = terms.filter((term) => !haystack.includes(term))
  const score = terms.length > 0 ? Math.round((matched.length / terms.length) * 100) : 0
  return { score, terms: terms.length, matched, missing }
}
