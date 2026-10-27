import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../services/api'
import { setUIVersion } from '../store'
import GoogleButton from '../../components/auth/GoogleButton'
import '../ui.css'

export default function AuthStudio({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (isLogin) {
        await login(form.email.trim(), form.password)
      } else {
        await register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        })
      }
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(errorMessage(err, isLogin ? 'Could not sign in.' : 'Could not create the account.'))
      setBusy(false)
    }
  }

  const other = isLogin ? '/register' : '/login'
  const otherQuery = returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''

  return (
    <div className="ui-studio">
      <div className="st-ambient" aria-hidden="true" />
      <div className="st-auth">
        <aside className="st-auth-aside">
          <div>
            <div className="st-row" style={{ gap: 10 }}>
              <img src="/logo.jpeg" alt="" className="st-rail-logo" style={{ marginBottom: 0, objectFit: 'cover' }} />
              <span style={{ fontWeight: 600, letterSpacing: '-.02em' }}>AI Interviewer</span>
            </div>
            <div style={{ marginTop: 64, maxWidth: 430 }}>
              <p className="st-eyebrow" style={{ margin: 0 }}>Interview studio</p>
              <h1 className="st-display" style={{ marginTop: 12 }}>
                Practise the interview.<br />Keep the evidence.
              </h1>
              <p className="st-sub" style={{ fontSize: 15, marginTop: 16 }}>
                Adaptive questions, a five-criterion rubric and a report that quotes your own answers — not a vibe score.
              </p>
            </div>
          </div>

          <div className="st-card" style={{ maxWidth: 400, background: 'rgba(255,255,255,.03)' }}>
            <div className="st-between">
              <p className="st-eyebrow" style={{ margin: 0 }}>What you get</p>
              <span className="st-chip st-chip-ok">Evidence checked</span>
            </div>
            <ul className="st-pre" style={{ paddingLeft: 18, marginTop: 12, fontSize: 12.5 }}>
              <li>Questions from the role and your resume</li>
              <li>Text, voice and coding answers in one session</li>
              <li>A report with rubric, quotes and next drills</li>
            </ul>
          </div>
        </aside>

        <main className="st-auth-main">
          <div className="st-auth-card">
            <div className="st-between" style={{ marginBottom: 26 }}>
              <p className="st-eyebrow" style={{ margin: 0 }}>{isLogin ? 'Welcome back' : 'Create an account'}</p>
              <button type="button" className="st-btn st-btn-ghost st-btn-sm" onClick={() => setUIVersion('classic')}>
                <ArrowLeftRight size={13} /> Classic
              </button>
            </div>

            <h2 className="st-display" style={{ fontSize: 28 }}>{isLogin ? 'Sign in to the studio' : 'Set up your studio'}</h2>
            <p className="st-sub" style={{ marginBottom: 24 }}>
              {isLogin ? 'Continue where you left off.' : 'No credit card. The local build keeps everything on this machine.'}
            </p>

            <form onSubmit={submit} className="st-stack" style={{ gap: 14 }}>
              {!isLogin && (
                <div>
                  <label className="st-label" htmlFor="auth-name">Full name</label>
                  <input id="auth-name" className="st-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required autoComplete="name" />
                </div>
              )}
              <div>
                <label className="st-label" htmlFor="auth-email">{isLogin ? 'Email or phone' : 'Email'}</label>
                <input id="auth-email" type={isLogin ? 'text' : 'email'} className="st-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete={isLogin ? 'username' : 'email'} />
              </div>
              <div>
                <label className="st-label" htmlFor="auth-password">Password</label>
                <input id="auth-password" type="password" className="st-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                {!isLogin && <p className="st-dim" style={{ fontSize: 11.5, margin: '6px 0 0' }}>At least 8 characters.</p>}
              </div>
              {!isLogin && (
                <div>
                  <label className="st-label" htmlFor="auth-phone">Phone (optional)</label>
                  <input id="auth-phone" className="st-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                  <p className="st-dim" style={{ fontSize: 11.5, margin: '6px 0 0' }}>You can sign in with this number and your password. It is not SMS-verified yet.</p>
                </div>
              )}
              {error && <div className="st-banner st-banner-bad">{error}</div>}
              <button type="submit" className="st-btn st-btn-primary st-btn-lg" style={{ width: '100%' }} disabled={busy}>
                {busy ? 'Working…' : isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={15} />
              </button>
            </form>

            <GoogleButton />

            <p className="st-dim" style={{ fontSize: 12.5, marginTop: 18 }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link to={other + otherQuery} style={{ color: 'var(--st-text)' }}>{isLogin ? 'Create one' : 'Sign in'}</Link>
            </p>
            <p className="st-dim" style={{ fontSize: 11, marginTop: 14 }}>
              <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/cookies">Cookies</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
