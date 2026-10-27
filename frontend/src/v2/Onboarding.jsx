import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, SkipForward, Sparkles } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const KEY = 'studio-onboarded'

const ROLES = [
  'Frontend', 'Backend', 'Full-stack', 'Data', 'ML / AI', 'DevOps / SRE', 'Mobile', 'Product', 'Other',
]
const LEVELS = [
  { id: 'BASIC', title: 'BASIC', sub: '0–2 years', copy: 'Definitions, fundamentals, guided reasoning.' },
  { id: 'ADVANCED', title: 'ADVANCED', sub: '3–6 years', copy: 'Trade-offs, failure modes, design decisions.' },
  { id: 'EXPERT', title: 'EXPERT', sub: '7+ years', copy: 'Ambiguous constraints, scale, incident judgement.' },
]
const STRENGTHS = [
  'System design', 'Algorithms', 'Debugging', 'Databases', 'APIs', 'Cloud', 'Communication', 'Ownership',
]
const FOCUS = [
  'Structuring answers', 'Technical depth', 'Concise delivery', 'System design', 'Coding under pressure', 'Behavioural stories',
]

const readDone = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}
export const needsOnboarding = () => !readDone()

const Toggle = ({ active, children, onClick }) => (
  <button type="button" onClick={onClick} aria-pressed={active} className={`st-chip${active ? ' st-chip-accent' : ''}`}
    style={{ height: 32, fontSize: 12, cursor: 'pointer' }}>
    {active && <Check size={12} />} {children}
  </button>
)

export default function Onboarding({ onDone }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.fullName || '',
    role: '',
    level: 'ADVANCED',
    strengths: [],
    focus: [],
    note: '',
  })

  const total = 5
  const canContinue = useMemo(() => {
    if (step === 0) return form.name.trim().length > 1
    if (step === 1) return Boolean(form.role)
    if (step === 2) return Boolean(form.level)
    if (step === 3) return form.strengths.length > 0
    return form.focus.length > 0 || form.note.trim().length > 3
  }, [step, form])

  const toggle = (field, value) => setForm((current) => {
    const list = current[field]
    return { ...current, [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] }
  })

  const persist = async (skipped = false) => {
    setSaving(true)
    const payload = { ...form, skipped }
    try {
      const summary = skipped
        ? (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).profileSummary : undefined)
        : `Targeting ${form.role} roles · ${form.level} tier. Strengths: ${form.strengths.join(', ') || 'not set'}. Focus: ${form.focus.join(', ') || form.note || 'not set'}.`
      if (!skipped) {
        const { data } = await api.put('/users/profile', {
          fullName: form.name.trim(),
          profileSummary: summary,
          phone: null,
          linkedinUrl: null,
          githubUrl: null,
        })
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...stored, ...data }))
      }
    } catch {
      /* the local answers still work; the profile save can be retried in Settings */
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
    try {
      const prefs = JSON.parse(localStorage.getItem('studio-preferences') || '{}')
      localStorage.setItem('studio-preferences', JSON.stringify({
        ...prefs,
        level: payload.level,
        focus: payload.focus,
        note: payload.note,
      }))
    } catch { /* ignore a corrupt preference blob */ }
    setSaving(false)
    if (skipped) onDone()
    else window.location.assign('/')
  }

  const next = () => (step < total - 1 ? setStep(step + 1) : persist(false))
  const back = () => (step > 0 ? setStep(step - 1) : null)

  const cardStyle = { width: '100%', maxWidth: 720 }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90, display: 'grid', placeItems: 'center',
      padding: 20, background: 'rgba(4,5,8,.55)', backdropFilter: 'blur(8px)',
    }}>
      <motion.div
        className="st-card" style={{ ...cardStyle, padding: 30, position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 18, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .45, ease: [.16, 1, .3, 1] }}
      >
        <div style={{ position: 'absolute', inset: '-40% -20% auto auto', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.22), transparent 65%)', pointerEvents: 'none' }} />

        <div className="st-between" style={{ position: 'relative' }}>
          <div className="st-row" style={{ gap: 8 }}>
            <span className="st-rail-logo" style={{ width: 30, height: 30, borderRadius: 9, fontSize: 10, marginBottom: 0 }}>AI</span>
            <span className="st-eyebrow">A 60-second intro</span>
          </div>
          <button type="button" className="st-btn st-btn-ghost st-btn-sm" onClick={() => persist(true)} disabled={saving}>
            <SkipForward size={13} /> Skip
          </button>
        </div>

        <div style={{ display: 'flex', gap: 5, margin: '18px 0 24px', position: 'relative' }}>
          {Array.from({ length: total }).map((_, index) => (
            <span key={index} style={{
              height: 3, flex: 1, borderRadius: 999,
              background: index <= step ? 'linear-gradient(90deg,#f59e0b,#fde68a)' : 'rgba(255,255,255,.10)',
              boxShadow: index === step ? '0 0 12px rgba(245,158,11,.6)' : 'none',
              transition: 'background .2s ease',
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', minHeight: 300 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: .22, ease: 'easeOut' }}
            >
              {step === 0 && (
                <>
                  <p className="st-eyebrow" style={{ margin: 0 }}>01 · Name</p>
                  <h2 className="st-display" style={{ fontSize: 30, marginTop: 8 }}>What should we call you?</h2>
                  <p className="st-sub">It appears on your reports and in the interviewer’s greeting.</p>
                  <input className="st-input" style={{ marginTop: 22, fontSize: 16, height: 52 }} value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })} autoFocus
                    placeholder="e.g. Eshan" aria-label="What should we call you" />
                </>
              )}

              {step === 1 && (
                <>
                  <p className="st-eyebrow" style={{ margin: 0 }}>02 · Target</p>
                  <h2 className="st-display" style={{ fontSize: 30, marginTop: 8 }}>What are you preparing for?</h2>
                  <p className="st-sub">We use it to pick the role, the tier and the question mix.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                    {ROLES.map((role) => (
                      <Toggle key={role} active={form.role === role} onClick={() => setForm({ ...form, role })}>{role}</Toggle>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="st-eyebrow" style={{ margin: 0 }}>03 · Experience</p>
                  <h2 className="st-display" style={{ fontSize: 30, marginTop: 8 }}>Where are you right now?</h2>
                  <p className="st-sub">This sets the default difficulty. You can change it per role.</p>
                  <div className="st-stack" style={{ marginTop: 20, gap: 8 }}>
                    {LEVELS.map((level) => (
                      <button key={level.id} type="button" onClick={() => setForm({ ...form, level: level.id })}
                        className={`st-role${form.level === level.id ? ' is-active' : ''}`} aria-pressed={form.level === level.id}>
                        <div className="st-between">
                          <div className="st-row">
                            <span className="st-role-dot" />
                            <div>
                              <strong style={{ fontSize: 13.5 }}>{level.title}</strong>
                              <p className="st-dim" style={{ margin: '2px 0 0', fontSize: 12 }}>{level.copy}</p>
                            </div>
                          </div>
                          <span className="st-chip">{level.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="st-eyebrow" style={{ margin: 0 }}>04 · Strengths</p>
                  <h2 className="st-display" style={{ fontSize: 30, marginTop: 8 }}>What are you strongest at?</h2>
                  <p className="st-sub">Pick everything that applies. The report will look for evidence of these.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                    {STRENGTHS.map((item) => (
                      <Toggle key={item} active={form.strengths.includes(item)} onClick={() => toggle('strengths', item)}>{item}</Toggle>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <p className="st-eyebrow" style={{ margin: 0 }}>05 · Focus</p>
                  <h2 className="st-display" style={{ fontSize: 30, marginTop: 8 }}>What should we push you on?</h2>
                  <p className="st-sub">Choose one or more. The first drill on your dashboard will target it.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                    {FOCUS.map((item) => (
                      <Toggle key={item} active={form.focus.includes(item)} onClick={() => toggle('focus', item)}>{item}</Toggle>
                    ))}
                  </div>
                  <input className="st-input" style={{ marginTop: 16 }} value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    placeholder="Anything else? e.g. a specific company or round" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="st-between" style={{ marginTop: 24, position: 'relative' }}>
          <button type="button" className="st-btn st-btn-ghost" onClick={back} disabled={step === 0 || saving}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="st-row">
            <span className="st-dim" style={{ fontSize: 12 }}>{step + 1} / {total}</span>
            <button type="button" className="st-btn st-btn-primary" onClick={next} disabled={!canContinue || saving}>
              {saving ? 'Saving…' : step === total - 1 ? 'Enter the studio' : 'Continue'}
              {step === total - 1 ? <Sparkles size={15} /> : <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
