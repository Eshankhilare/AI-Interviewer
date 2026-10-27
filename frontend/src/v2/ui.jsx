import { Link } from 'react-router-dom'

export const scoreColor = (score) => {
  if (score == null) return 'var(--st-dim)'
  if (score >= 70) return 'var(--st-ok)'
  if (score >= 50) return 'var(--st-warn)'
  return 'var(--st-bad)'
}

export const gradeClass = (score) => {
  if (score == null) return 'st-chip'
  if (score >= 70) return 'st-chip st-chip-ok'
  if (score >= 50) return 'st-chip st-chip-warn'
  return 'st-chip st-chip-bad'
}

export const formatDate = (iso) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export const ScoreRing = ({ value, size = 108, label = '/100' }) => {
  const score = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : null
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const dash = score == null ? 0 : (score / 100) * circumference
  return (
    <div className="st-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 108 108" aria-hidden="true">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
        <circle
          cx="54" cy="54" r={radius} fill="none"
          stroke={scoreColor(score)} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="st-ring-value" style={{ color: score == null ? 'var(--st-dim)' : 'var(--st-text)' }}>
        {score == null ? '—' : score}
        <small>{label}</small>
      </div>
    </div>
  )
}

export const BarRow = ({ label, value, max = 100 }) => (
  <div className="st-bar-row">
    <span className="st-dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    <div className="st-bar"><span style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }} /></div>
    <b>{value ?? '—'}</b>
  </div>
)

export const Empty = ({ icon: Icon, title, children, action }) => (
  <div className="st-empty">
    {Icon && <Icon size={26} style={{ color: 'var(--st-dim)' }} />}
    <h3>{title}</h3>
    {children && <p>{children}</p>}
    {action && <div style={{ marginTop: 18 }}>{action}</div>}
  </div>
)

export const SkeletonBlock = ({ height = 16, width = '100%', style }) => (
  <div
    style={{
      height, width, borderRadius: 8,
      background: 'linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.08), rgba(255,255,255,.04))',
      ...style,
    }}
  />
)

export const PageHead = ({ eyebrow, title, sub, actions }) => (
  <div className="st-between" style={{ alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
    <div>
      {eyebrow && <p className="st-eyebrow" style={{ margin: '0 0 8px' }}>{eyebrow}</p>}
      <h1 className="st-display">{title}</h1>
      {sub && <p className="st-sub" style={{ maxWidth: 620 }}>{sub}</p>}
    </div>
    {actions && <div className="st-row" style={{ flexWrap: 'wrap' }}>{actions}</div>}
  </div>
)

export const BackLink = ({ to = '/', children = 'Back' }) => (
  <Link to={to} className="st-row st-dim" style={{ textDecoration: 'none', fontSize: 13, gap: 6 }}>
    <span aria-hidden="true">←</span> {children}
  </Link>
)
