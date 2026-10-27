// Deterministic coaching plan for a finished report. Every step is derived from
// a score already in the report; no extra model call, so nothing is invented.
// Inspired by the "what to practise next" loops in Interviewer.AI / Final Round.

const TIPS = {
  Relevance: 'Open with a one-sentence answer to the exact question, then add context.',
  'Technical Depth': 'Add one trade-off and one failure mode for every design you mention.',
  Correctness: 'Name the mechanism, not just the outcome.',
  Clarity: 'Use STAR for behavioural answers; keep one idea per sentence.',
  Evidence: 'Attach a number, tool, or outcome to each claim.',
}

const firstSuggestion = (question) => {
  const raw = question?.improvementSuggestions
  if (!raw) return null
  if (Array.isArray(raw)) return raw[0] || null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed[0] || null
  } catch {
    // plain text is fine
  }
  return String(raw).replace(/^[["'\s]+|[\]"'\s]+$/g, '').split(/\r?\n/)[0] || null
}

export function buildPracticePlan({ radar = [], breakdown = [] } = {}) {
  const weakestSkills = [...radar]
    .filter((item) => item && item.skill && Number.isFinite(Number(item.score)))
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 2)

  const scored = [...breakdown]
    .filter((q) => q && Number.isFinite(Number(q.score)))
    .sort((a, b) => Number(a.score) - Number(b.score))
  const weakestQuestion = scored[0] || null

  const steps = []

  if (weakestQuestion) {
    const detail = firstSuggestion(weakestQuestion)
      || (weakestSkills[0] ? TIPS[weakestSkills[0].skill] : null)
      || 'Answer it again out loud, then compare with the sample response.'
    steps.push({
      title: `Rebuild Q${weakestQuestion.questionOrder || 1} — ${weakestQuestion.score}/100`,
      detail,
    })
  }

  if (weakestSkills[0]) {
    const { skill, score } = weakestSkills[0]
    steps.push({
      title: `Drill ${skill} — ${score}/100`,
      detail: TIPS[skill] || 'Practise one answer that targets this criterion, then re-read the feedback.',
    })
  }

  if (weakestSkills[1] || weakestQuestion) {
    const secondary = weakestSkills[1]?.skill
    steps.push({
      title: 'Next session',
      detail: secondary
        ? `Run a five-question interview and watch ${secondary.toLowerCase()} as well; move up a difficulty once you hold 70+.`
        : 'Run a five-question interview on the same role; move up a difficulty once you hold 70+.',
    })
  }

  return steps
}

export { TIPS }
