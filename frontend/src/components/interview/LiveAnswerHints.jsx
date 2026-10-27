import { useMemo } from 'react'
import { analyzeAnswer } from '../../utils/answerInsights'

const tone = (rate) => (rate <= 3 ? '#4ade80' : rate <= 8 ? '#fbbf24' : '#f87171')

// Live coaching while the answer is being written or spoken. Same counts as the
// post-answer panel, just earlier — so the candidate can correct mid-answer.
const LiveAnswerHints = ({ text, behavioral = false }) => {
  const insights = useMemo(
    () => analyzeAnswer({ text, behavioral }),
    [text, behavioral],
  )

  if (!text || !text.trim()) {
    return (
      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,.25)' }}>
        Counts appear here as you type or speak — words, filler words{behavioral ? ' and STAR parts' : ''}.
      </p>
    )
  }

  const starHits = insights.star ? insights.star.filter((part) => part.hit).length : 0

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs">
      <span style={{ color: 'rgba(255,255,255,.45)' }}>
        {insights.words} word{insights.words === 1 ? '' : 's'}
      </span>
      <span style={{ color: insights.fillerCount ? tone(insights.fillerRate) : 'rgba(255,255,255,.35)' }}>
        fillers {insights.fillerCount} ({insights.fillerRate}%)
      </span>
      {insights.topWords[0] && (
        <span style={{ color: 'rgba(255,255,255,.35)' }}>
          repeating “{insights.topWords[0].word}” ×{insights.topWords[0].count}
        </span>
      )}
      {behavioral && insights.star && (
        <span className="inline-flex items-center gap-1">
          <span style={{ color: 'rgba(255,255,255,.35)' }}>STAR</span>
          {insights.star.map((part) => (
            <span
              key={part.key}
              title={part.label}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                background: part.hit ? 'rgba(74,222,128,.16)' : 'rgba(255,255,255,.05)',
                color: part.hit ? '#86efac' : 'rgba(255,255,255,.3)',
                border: `1px solid ${part.hit ? 'rgba(74,222,128,.35)' : 'rgba(255,255,255,.08)'}`,
              }}
            >
              {part.label[0]}
            </span>
          ))}
          <span style={{ color: starHits >= 3 ? '#4ade80' : 'rgba(255,255,255,.35)' }}>{starHits}/4</span>
        </span>
      )}
    </div>
  )
}

export default LiveAnswerHints
