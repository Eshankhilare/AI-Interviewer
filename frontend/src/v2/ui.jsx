import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const target = score == null ? 0 : (score / 100) * circumference
  const reduce = useReducedMotion()
  const [dash, setDash] = useState(reduce ? target : 0)
  const [shown, setShown] = useState(reduce ? score : (score == null ? null : 0))

  useEffect(() => {
    if (score == null) { setDash(0); setShown(null); return undefined }
    if (reduce) { setDash(target); setShown(score); return undefined }
    setDash(0)
    setShown(0)
    let raf
    const started = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - started) / 950)
      const eased = 1 - Math.pow(1 - p, 3)
      setDash(target * eased)
      setShown(Math.round(score * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score, target, reduce])

  return (
    <div className="st-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 108 108" aria-hidden="true">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="8" />
        <circle
          cx="54" cy="54" r={radius} fill="none"
          stroke={scoreColor(score)} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="st-ring-value" style={{ color: score == null ? 'var(--st-dim)' : 'var(--st-text)' }}>
        {shown == null ? '—' : shown}
        <small>{label}</small>
      </div>
    </div>
  )
}

export const BarRow = ({ label, value, max = 100 }) => {
  const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100))
  const reduce = useReducedMotion()
  const [width, setWidth] = useState(reduce ? pct : 0)
  useEffect(() => {
    if (reduce) { setWidth(pct); return undefined }
    const id = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(id)
  }, [pct, reduce])
  return (
    <div className="st-bar-row">
      <span className="st-dim" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div className="st-bar">
        <span style={{ width: `${width}%` }} />
      </div>
      <b>{value ?? '—'}</b>
    </div>
  )
}

export const Reveal = ({ children, delay = 0, className = '', style }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
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
