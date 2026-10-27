import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, ChatIcon, ClockIcon, EvalIcon, ReportIcon } from './icons'
import './LandingProductDemo.css'

const QUESTIONS = [
  {
    type: 'SYSTEM DESIGN',
    level: 'ADVANCED',
    text: 'Your API is hit by a 10× traffic spike. Walk me through how you keep it serving.',
    answer: 'First I protect the core: rate-limit per key, shed non-critical work, and move reads to a cache. Then I look for the single hot path...',
  },
  {
    type: 'BEHAVIOURAL',
    level: 'MID',
    text: 'Tell me about a time you disagreed with a teammate about a technical decision.',
    answer: 'We disagreed about validation living in the controller or the service. I asked for a 30-minute design review with both options written down...',
  },
  {
    type: 'CODING',
    level: 'ADVANCED',
    text: 'Given a stream of events, return the top K services by error rate in the last minute.',
    answer: 'A sliding window per service with a min-heap of size K. The window keeps counts, the heap keeps the current leaders...',
  },
]

const RUBRIC = [
  ['Relevance', 92],
  ['Technical depth', 90],
  ['Correctness', 91],
  ['Clarity', 86],
  ['Evidence', 90],
]

const scoreAt = (value, target, delay = 0) => ({
  initial: { width: 0 },
  animate: { width: `${(value / target) * 100}%` },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function LandingProductDemo() {
  const [view, setView] = useState('live')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const question = QUESTIONS[index]

  useEffect(() => {
    if (view !== 'report') return undefined
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 900)
      setScore(Math.round(91 * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [view])

  return (
    <div className="lpd">
      <header className="lpd-topbar">
        <span className="lpd-brand">
          <span className="lpd-logo">AI</span>
          <span className="lpd-brand-name">AI Interviewer</span>
        </span>
        <div className="lpd-tabs" role="tablist" aria-label="Preview">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'live'}
            className={view === 'live' ? 'is-active' : ''}
            onClick={() => setView('live')}
          >
            <ChatIcon className="lpd-tab-icon" /> Live
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'report'}
            className={view === 'report' ? 'is-active' : ''}
            onClick={() => setView('report')}
          >
            <ReportIcon className="lpd-tab-icon" /> Report
          </button>
        </div>
        <span className="lpd-live"><span className="lpd-dot" /> Interactive preview</span>
      </header>

      {view === 'live' ? (
        <div className="lpd-live-view">
          <div className="lpd-main">
            <div className="lpd-meta">
              <span className="lpd-chip">{question.type}</span>
              <span className="lpd-chip lpd-chip-soft">{question.level}</span>
              <span className="lpd-chip lpd-chip-soft"><ClockIcon className="lpd-mini" /> 18:42</span>
              <span className="lpd-progress-label">Question {index + 1} of 3</span>
            </div>
            <div className="lpd-progress"><span style={{ width: `${((index + 1) / 3) * 100}%` }} /></div>
            <motion.h3 key={question.text} className="lpd-question" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              {question.text}
            </motion.h3>
            <div className="lpd-answer">
              <span className="lpd-label">Your answer</span>
              <p>{question.answer}<span className="lpd-caret" /></p>
            </div>
            <div className="lpd-actions">
              <button type="button" className="lpd-btn" onClick={() => setIndex((index + 1) % QUESTIONS.length)}>
                Next question
              </button>
              <button type="button" className="lpd-btn lpd-btn-primary" onClick={() => setView('report')}>
                Score this answer <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <aside className="lpd-side">
            <span className="lpd-label">Signals</span>
            <div className="lpd-signal"><span><EvalIcon className="lpd-side-icon" /> Structure</span><b>Good</b></div>
            <div className="lpd-signal"><span><ClockIcon className="lpd-side-icon" /> Pace</span><b>1:42</b></div>
            <div className="lpd-signal"><span><CheckIcon className="lpd-side-icon" /> Evidence</span><b>2 quotes</b></div>
            <div className="lpd-note">The rubric checks every quote against your answer — invented evidence is flagged.</div>
          </aside>
        </div>
      ) : (
        <div className="lpd-report-view">
          <div className="lpd-report-head">
            <div>
              <span className="lpd-eyebrow">Assessment summary</span>
              <h3 className="lpd-report-title">{question.type.toLowerCase()} round · report</h3>
              <div className="lpd-meta">
                <span className="lpd-chip lpd-chip-ok">Recommended</span>
                <span className="lpd-chip lpd-chip-soft">1 answer</span>
                <span className="lpd-chip lpd-chip-soft">5 criteria</span>
              </div>
            </div>
            <div className="lpd-score">
              <span className="lpd-score-num">{score}</span>
              <span className="lpd-score-sub">/100 · A+</span>
            </div>
          </div>

          <div className="lpd-report-grid">
            <div className="lpd-card">
              <span className="lpd-label">Rubric</span>
              {RUBRIC.map(([label, value], i) => (
                <div className="lpd-bar-row" key={label}>
                  <span>{label}</span>
                  <div className="lpd-bar"><motion.i {...scoreAt(value, 100, i * 0.07)} /></div>
                  <b>{value}</b>
                </div>
              ))}
            </div>
            <div className="lpd-card">
              <span className="lpd-label">Verdict</span>
              <p className="lpd-verdict">A strong answer that names the failure domains and the trade-off. Push further on the rollback window.</p>
              <div className="lpd-quote">“Rate-limit per key, shed non-critical work, and move reads to a cache.”</div>
              <div className="lpd-actions">
                <button type="button" className="lpd-btn" onClick={() => setView('live')}>Back to live</button>
                <button type="button" className="lpd-btn lpd-btn-primary" onClick={() => setIndex((index + 1) % QUESTIONS.length)}>Try another</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
