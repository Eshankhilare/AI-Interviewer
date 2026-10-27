import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, LogOut, Save, ShieldCheck, Waves, MonitorPlay } from 'lucide-react'
import api, { errorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { setUIVersion, useBackground } from '../store'
import { PageHead, SkeletonBlock } from '../ui'

const PREF_KEY = 'studio-preferences'
const defaults = { mode: 'TEXT', count: 10, camera: false }

const readPrefs = () => {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') } } catch { return defaults }
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { background, setBackground } = useBackground()
  const [form, setForm] = useState(null)
  const [prefs, setPrefs] = useState(readPrefs)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        profileSummary: data.profileSummary || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
      }))
      .catch(() => setForm({ fullName: user?.fullName || '', phone: '', profileSummary: '', linkedinUrl: '', githubUrl: '' }))
  }, [user])

  const save = async (event) => {
    event.preventDefault()
    if (!form || saving) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.put('/users/profile', form)
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...data }))
      setMessage('Profile saved.')
    } catch (err) {
      setError(errorMessage(err, 'Could not save the profile.'))
    } finally {
      setSaving(false)
    }
  }

  const savePrefs = (next) => {
    setPrefs(next)
    localStorage.setItem(PREF_KEY, JSON.stringify(next))
  }

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="st-content st-narrow">
      <PageHead eyebrow="Settings" title="Your studio" sub="Profile, interview defaults and appearance. Changes save locally, except the profile which is stored on the server." />

      {!form ? <SkeletonBlock height={280} /> : (
        <div className="st-stack" style={{ gap: 16 }}>
          <section className="st-card">
            <div className="st-between" style={{ marginBottom: 16 }}>
              <div>
                <h2 className="st-h2">Profile</h2>
                <p className="st-sub">{user?.email}</p>
              </div>
              <div className="st-row">
                <button type="button" className="st-btn st-btn-sm" onClick={() => { localStorage.removeItem('studio-onboarded'); window.location.reload() }}>
                  Retake intro
                </button>
                <span className="st-chip"><ShieldCheck size={12} /> {user?.role || 'CANDIDATE'}</span>
              </div>
            </div>
            <form onSubmit={save}>
              <div className="st-grid-2">
                <div>
                  <label className="st-label" htmlFor="set-name">Full name</label>
                  <input id="set-name" className="st-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="st-label" htmlFor="set-phone">Phone</label>
                  <input id="set-phone" className="st-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="st-label" htmlFor="set-linkedin">LinkedIn</label>
                  <input id="set-linkedin" className="st-input" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://" />
                </div>
                <div>
                  <label className="st-label" htmlFor="set-github">GitHub</label>
                  <input id="set-github" className="st-input" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="st-label" htmlFor="set-summary">Profile summary</label>
                <textarea id="set-summary" className="st-textarea" rows={4} value={form.profileSummary}
                  onChange={(e) => setForm({ ...form, profileSummary: e.target.value })}
                  placeholder="A short summary the interviewer can use for context." />
              </div>
              <div className="st-between" style={{ marginTop: 14 }}>
                <span className="st-dim" style={{ fontSize: 12 }}>{message || (error ? '' : '')}</span>
                <button type="submit" className="st-btn st-btn-primary" disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
              {error && <div className="st-banner st-banner-bad" style={{ marginTop: 12 }}>{error}</div>}
              {message && <div className="st-banner st-banner-warn" style={{ marginTop: 12 }}>{message}</div>}
            </form>
          </section>

          <div className="st-grid-2">
            <section className="st-card">
              <h2 className="st-h2">Interview defaults</h2>
              <div style={{ marginTop: 16 }}>
                <label className="st-label">Answer mode</label>
                <div className="st-tabs" style={{ width: '100%' }}>
                  {[['TEXT', 'Text'], ['VOICE', 'Voice']].map(([value, label]) => (
                    <button key={value} type="button" className={`st-tab${prefs.mode === value ? ' is-active' : ''}`}
                      style={{ flex: 1 }} onClick={() => savePrefs({ ...prefs, mode: value })}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="st-label" htmlFor="set-count">Questions · {prefs.count}</label>
                <input id="set-count" type="range" min="3" max="20" value={prefs.count}
                  onChange={(e) => savePrefs({ ...prefs, count: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--st-accent)' }} />
              </div>
              <label className="st-row" style={{ marginTop: 16, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={prefs.camera} onChange={(e) => savePrefs({ ...prefs, camera: e.target.checked })}
                  style={{ accentColor: 'var(--st-accent)' }} />
                Offer camera signals by default
              </label>
              <p className="st-dim" style={{ fontSize: 11.5, marginBottom: 0 }}>
                The camera still requires a click in the session.
              </p>
            </section>

            <section className="st-card">
              <h2 className="st-h2">Appearance</h2>
              <p className="st-sub" style={{ marginTop: 8 }}>
                The original interface is kept intact and can be switched at any time.
              </p>
              <div className="st-stack" style={{ marginTop: 16, gap: 8 }}>
                <button type="button" className="st-btn" onClick={() => setUIVersion('studio')} style={{ justifyContent: 'space-between' }}>
                  <span>Interview Studio</span><span className="st-chip st-chip-accent">Current</span>
                </button>
                <button type="button" className="st-btn" onClick={() => setUIVersion('classic')} style={{ justifyContent: 'space-between' }}>
                  <span>Classic interface</span><ArrowLeftRight size={14} />
                </button>
              </div>
              <div className="st-banner" style={{ marginTop: 16, fontSize: 12 }}>
                Switching updates every page immediately. Your choice is remembered in this browser.
              </div>

              <div style={{ height: 1, background: 'var(--st-line)', margin: '18px 0' }} />
              <h3 className="st-h3">Background</h3>
              <div className="st-stack" style={{ marginTop: 10, gap: 8 }}>
                <button
                  type="button"
                  className="st-btn"
                  style={{ justifyContent: 'space-between' }}
                  onClick={() => setBackground('video')}
                  aria-pressed={background === 'video'}
                >
                  <span className="st-row"><MonitorPlay size={14} /> Original video</span>
                  {background === 'video' ? <span className="st-chip st-chip-accent">Current</span> : null}
                </button>
                <button
                  type="button"
                  className="st-btn"
                  style={{ justifyContent: 'space-between' }}
                  onClick={() => setBackground('flux')}
                  aria-pressed={background === 'flux'}
                >
                  <span className="st-row"><Waves size={14} /> Flux lines</span>
                  {background === 'flux' ? <span className="st-chip st-chip-accent">Current</span> : null}
                </button>
              </div>
              <p className="st-dim" style={{ fontSize: 11.5, marginBottom: 0 }}>
                Flux lines are a live WebGL background; the original video stays available.
              </p>
            </section>
          </div>

          <section className="st-card">
            <div className="st-between">
              <div>
                <h2 className="st-h2">Account</h2>
                <p className="st-sub">Signed in as {user?.email}.</p>
              </div>
              <button type="button" className="st-btn" onClick={signOut}><LogOut size={14} /> Sign out</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
