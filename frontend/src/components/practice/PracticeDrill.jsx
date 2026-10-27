import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { GlassCard, GlassBadge, WhiteButton, GlassInput } from '../ui/glass'
import AnswerInsights from '../interview/AnswerInsights'
import LiveAnswerHints from '../interview/LiveAnswerHints'
import { analyzeAnswer } from '../../utils/answerInsights'
import { intervalLabel } from '../../utils/spacedRepetition'

const GRADES = [
  { id: 'again', label: 'Again', color: '#f87171' },
  { id: 'hard', label: 'Hard', color: '#fbbf24' },
  { id: 'good', label: 'Good', color: '#4ade80' },
  { id: 'easy', label: 'Easy', color: '#fbbf24' },
]

const PracticeDrill = ({ item, onGrade, onBack }) => {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [insights, setInsights] = useState(null)
  const [scheduled, setScheduled] = useState(null)

  useEffect(() => {
    setAnswer('')
    setRevealed(false)
    setInsights(null)
    setScheduled(null)
  }, [item?.key])

  if (!item) return null

  const reveal = () => {
    if (!answer.trim()) return
    setInsights(analyzeAnswer({
      text: answer,
      behavioral: item.questionType === 'BEHAVIORAL',
    }))
    setRevealed(true)
  }

  const grade = (id) => {
    setScheduled(intervalLabel(item, id))
    onGrade(id)
  }

  return (
    <GlassCard className="p-6" hover={false}>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm mb-4" style={{ color: 'rgba(255,255,255,.5)' }}>
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </button>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <GlassBadge variant="primary">{item.questionType || 'QUESTION'}</GlassBadge>
        {item.score != null && <GlassBadge variant="warning">last scored {item.score}/100</GlassBadge>}
        <span className="text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>{item.sourceTitle || 'Saved question'}</span>
      </div>

      <h2 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>{item.question}</h2>

      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,.6)' }}>
        Answer from memory
      </label>
      <GlassInput
        as="textarea"
        rows={6}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Say it out loud, then type the version you would give in the interview..."
        style={{ resize: 'vertical' }}
      />
      <LiveAnswerHints text={answer} question={item.question} behavioral={item.questionType === 'BEHAVIORAL'} />

      {!revealed ? (
        <div className="mt-4 flex justify-end">
          <WhiteButton onClick={reveal} disabled={!answer.trim()} className="px-5 py-2.5 text-sm">
            Reveal feedback and check
          </WhiteButton>
        </div>
      ) : (
        <>
          {insights && (
            <div className="mt-5">
              <AnswerInsights insights={insights} behavioral={item.questionType === 'BEHAVIORAL'} />
            </div>
          )}

          {item.feedback && (
            <details className="mt-5">
              <summary className="text-xs font-semibold uppercase tracking-wider cursor-pointer" style={{ color: 'rgba(255,255,255,.4)' }}>
                Previous review
              </summary>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,.65)' }}>{item.feedback}</p>
            </details>
          )}

          {item.expectedAnswer && (
            <details className="mt-4">
              <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#4ade80' }}>Expected answer</summary>
              <p className="mt-2 text-sm p-3 rounded-xl" style={{ color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.04)' }}>{item.expectedAnswer}</p>
            </details>
          )}

          {item.sampleResponse && (
            <details className="mt-3">
              <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#fbbf24' }}>Stronger sample answer</summary>
              <p className="mt-2 text-sm p-3 rounded-xl" style={{ color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.04)' }}>{item.sampleResponse}</p>
            </details>
          )}

          <div className="mt-6" style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 16 }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,.75)' }}>How did that compare?</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,.35)' }}>
              Self-graded, so the next interval follows your judgement.
            </p>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((option) => (
                <button
                  key={option.id}
                  onClick={() => grade(option.id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors chip-btn"
                  style={{ borderColor: `${option.color}55`, color: option.color }}
                >
                  <span className="inline-flex flex-col items-start">
                    <span>{option.label}</span>
                    <span className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,.4)' }}>{intervalLabel(item, option.id)}</span>
                  </span>
                </button>
              ))}
            </div>
            {scheduled && (
              <p className="mt-3 text-sm inline-flex items-center gap-2" style={{ color: '#4ade80' }}>
                <CheckCircle2 className="h-4 w-4" /> Back {scheduled}
              </p>
            )}
          </div>
        </>
      )}

      {!revealed && item.expectedAnswer && (
        <p className="mt-4 text-xs inline-flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,.3)' }}>
          <RotateCcw className="h-3 w-3" /> Answer first, then compare — that is what makes recall stick.
        </p>
      )}
    </GlassCard>
  )
}

export default PracticeDrill
