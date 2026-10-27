import { Link } from 'react-router-dom'
import { ArrowIcon } from './icons'
import './LandingProductDemo.css'

const CRITERIA = [
  { label: 'Relevance', score: 9, weight: 15 },
  { label: 'Technical depth', score: 9, weight: 30 },
  { label: 'Correctness', score: 9, weight: 30 },
  { label: 'Clarity', score: 8, weight: 15 },
  { label: 'Evidence', score: 7, weight: 10 },
]

const TOTAL = Math.round(
  CRITERIA.reduce((sum, criterion) => sum + (criterion.score / 10) * criterion.weight, 0),
)

export default function LandingProductDemo() {
  return (
    <div className="lpd">
      <header className="lpd-topbar">
        <span className="lpd-brand">
          <img src="/logo.jpeg" alt="" className="lpd-logo" style={{ objectFit: 'cover' }} />
          <span className="lpd-brand-name">AI Interviewer</span>
        </span>
        <span className="lpd-live"><span className="lpd-dot" /> Evidence-checked rubric</span>
      </header>

      <div className="lpd-report-view">
        <div className="lpd-report-head">
          <div>
            <span className="lpd-eyebrow">Inside a scored answer</span>
            <h3 className="lpd-report-title">System design round · one answer</h3>
            <div className="lpd-meta">
              <span className="lpd-chip">5 criteria</span>
              <span className="lpd-chip lpd-chip-soft">Weights in code</span>
              <span className="lpd-chip lpd-chip-ok">Quotes verified</span>
            </div>
          </div>
          <div className="lpd-score">
            <span className="lpd-score-num">{TOTAL}</span>
            <span className="lpd-score-sub">/100 · A</span>
          </div>
        </div>

        <div className="lpd-report-grid">
          <div className="lpd-card">
            <span className="lpd-label">Rubric · each 0–10</span>
            {CRITERIA.map((criterion) => (
              <div className="lpd-bar-row" key={criterion.label}>
                <span>{criterion.label}</span>
                <div className="lpd-bar">
                  <i style={{ width: `${criterion.score * 10}%` }} />
                </div>
                <b>{criterion.score}/10</b>
              </div>
            ))}
            <p className="lpd-note" style={{ marginTop: 12 }}>
              Weighted 15 / 30 / 30 / 15 / 10. The number is computed here, not written by the model.
            </p>
          </div>

          <div className="lpd-card">
            <span className="lpd-label">The answer</span>
            <p className="lpd-question" style={{ fontSize: 15, marginTop: 8 }}>
              Your API is hit by a 10× traffic spike. Walk me through how you keep it serving.
            </p>
            <p className="lpd-verdict">
              First I protect the core:{' '}
              <mark style={{ background: 'rgba(245,158,11,.22)', color: '#fde68a', padding: '0 2px' }}>
                rate-limit per key
              </mark>
              , shed non-critical work, and move reads to a cache. Then I look for the single hot path.
            </p>
            <div className="lpd-quote">
              “rate-limit per key, shed non-critical work, and move reads to a cache”
            </div>
            <p className="lpd-note" style={{ marginTop: 10 }}>
              The quote is searched verbatim in the answer. Invented evidence caps that criterion.
            </p>
          </div>
        </div>

        <div className="lpd-proof">
          {[
            ['Verbatim quotes', 'Every quote is matched against the answer, not accepted on trust.'],
            ['Capped, not guessed', 'A quote that is missing from the answer caps that criterion at 5/10.'],
            ['Code-computed', 'The weights produce the score. The model does not write the number.'],
          ].map(([title, body]) => (
            <div key={title} className="lpd-proof-item">
              <p className="lpd-label" style={{ color: 'rgba(253,230,138,.8)' }}>{title}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="lpd-actions" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span className="lpd-label" style={{ letterSpacing: '.08em' }}>Real output · every interview</span>
          <Link
            to="/register"
            className="lpd-btn lpd-btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Try a real interview <ArrowIcon className="lpd-tab-icon" />
          </Link>
        </div>
      </div>
    </div>
  )
}
