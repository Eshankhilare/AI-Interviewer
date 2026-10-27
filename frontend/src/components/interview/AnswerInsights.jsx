import { GlassBadge } from '../ui/glass'

const MUTED = 'rgba(255,255,255,.45)'
const TONE = {
  good: '#4ade80',
  warn: '#fbbf24',
  bad: '#f87171',
  muted: MUTED,
}

const chip = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  borderRadius: 9999,
  fontSize: 12,
  border: `1px solid ${active ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.1)'}`,
  background: active ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.03)',
  color: active ? '#86efac' : MUTED,
})

const fillerTone = (rate) => (rate <= 3 ? 'good' : rate <= 8 ? 'warn' : 'bad')

const Stat = ({ label, value, tone = 'muted', hint }) => (
  <div>
    <div style={{ color: TONE[tone], fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
    <div style={{ color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
    {hint && <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{hint}</div>}
  </div>
)

const AnswerInsights = ({ insights, behavioral = false, compact = false }) => {
  if (!insights) return null
  const { words, fillerCount, fillerRate, fillerItems, topWords, talkingPoints, star, pace, avgSentenceWords } = insights
  const missedPoints = talkingPoints.filter((p) => !p.hit)
  const starHits = star ? star.filter((s) => s.hit).length : 0

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 12 }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, fontWeight: 600 }}>Answer insights</p>
        <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>counted from your words, no model call</span>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-3">
        <Stat label="words" value={words} />
        <Stat
          label="filler words"
          value={fillerItems.length ? `${fillerCount} (${fillerRate}%)` : '0'}
          tone={fillerCount ? fillerTone(fillerRate) : 'good'}
          hint={fillerCount ? fillerItems.slice(0, 3).map((f) => `“${f.word}” ×${f.count}`).join(' · ') : 'under the 3% guideline'}
        />
        {pace && <Stat label="pace" value={`${pace.wpm} wpm`} tone={pace.tone} hint={`${pace.label} · 130–170 is comfortable`} />}
        <Stat label="avg sentence" value={`${avgSentenceWords} words`} tone={avgSentenceWords > 35 ? 'warn' : 'muted'} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {talkingPoints.map((point) => (
          <span key={point.key} style={chip(point.hit)}>{point.hit ? '✓' : '·'} {point.label}</span>
        ))}
        {missedPoints.length > 0 && (
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, alignSelf: 'center' }}>
            missing: {missedPoints.map((p) => p.label.toLowerCase()).join(', ')}
          </span>
        )}
      </div>

      {star && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span style={{ color: MUTED, fontSize: 11, marginRight: 2 }}>STAR</span>
          {star.map((part) => (
            <span key={part.key} style={chip(part.hit)}>{part.hit ? '✓' : '·'} {part.label}</span>
          ))}
          {starHits < 3 && (
            <span style={{ color: TONE.warn, fontSize: 11 }}>aim for all four parts in behavioural answers</span>
          )}
        </div>
      )}

      {!compact && topWords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span style={{ color: MUTED, fontSize: 11, marginRight: 2 }}>Most used</span>
          {topWords.map((item) => (
            <GlassBadge key={item.word} variant="default">{item.word} ×{item.count}</GlassBadge>
          ))}
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>3+ repeats · vary the wording</span>
        </div>
      )}
    </div>
  )
}

export default AnswerInsights
