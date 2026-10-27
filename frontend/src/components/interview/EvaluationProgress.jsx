import { useEffect, useState } from 'react'

const STAGES = [
  { at: 0, label: 'Reading your answer' },
  { at: 5, label: 'Scoring relevance, depth, correctness, clarity and evidence' },
  { at: 15, label: 'Writing feedback and a stronger sample' },
  { at: 25, label: 'Still working — the rubric usually takes 20–30 seconds' },
]

// Honest waiting state for the rubric call. It reports elapsed time and what the
// evaluator is doing, not invented token-by-token progress.
const EvaluationProgress = ({ active }) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) {
      setSeconds(0)
      return undefined
    }
    setSeconds(0)
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [active])

  if (!active) return null

  const stage = [...STAGES].reverse().find((entry) => seconds >= entry.at) || STAGES[0]
  const width = Math.min(95, 10 + seconds * 3)

  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>
        <span>{stage.label}</span>
        <span style={{ color: 'rgba(255,255,255,.35)' }}>{seconds}s</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'rgba(255,255,255,.08)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: '#6366f1' }} />
      </div>
    </div>
  )
}

export default EvaluationProgress
