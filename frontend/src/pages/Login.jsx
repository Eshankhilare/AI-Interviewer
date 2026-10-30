import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassInput } from '../components/ui/glass'
import GoogleButton from '../components/auth/GoogleButton'
import { errorMessage } from '../services/api'
import { perfEnd, perfStart } from '../utils/perf'

const SLOW_REQUEST_MS = 8_000

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(() => {
    const reason = searchParams.get('error')
    if (reason === 'google_failed') return 'Google sign-in did not complete. Please try again or use email/phone.'
    if (reason === 'google_not_configured') return 'Google sign-in is not configured on this deployment yet.'
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  // A ref, not state, so a second submit in the same tick cannot slip through
  // before the disabled button has re-rendered.
  const inFlight = useRef(false)
  const renderStarted = useRef(perfStart())
  const loggedRender = useRef(false)

  useEffect(() => {
    if (loggedRender.current) return
    loggedRender.current = true
    perfEnd('login.initial-render', renderStarted.current)
  }, [])

  useEffect(() => {
    if (!loading) return undefined
    const timer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS)
    return () => clearTimeout(timer)
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setError('')
    setSlow(false)
    setLoading(true)
    try {
      await login(email, password)
      navigate(searchParams.get('returnTo') || '/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Login failed.'))
    } finally {
      inFlight.current = false
      setLoading(false)
      setSlow(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [.22,1,.36,1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <GlassCard className="p-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <img src="/logo.jpeg" alt="AI Interviewer" className="w-14 h-14 mx-auto rounded-2xl object-cover mb-4"
              style={{ border: '1px solid rgba(245,158,11,.35)', boxShadow: '0 4px 20px rgba(245,158,11,.3)' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#fff', fontWeight: 500 }}>Welcome back</h2>
            <p className="mt-1" style={{ color: 'rgba(255,255,255,.76)' }}>Sign in to continue your interview prep</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl"
              role="alert"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}
            >
              <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Email or phone</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com or +91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <WhiteButton
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black" aria-hidden="true" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </WhiteButton>
            {slow && (
              <p className="text-xs text-center mt-2" role="status" style={{ color: 'rgba(255,255,255,.78)' }}>
                The server is taking longer than usual. Still working…
              </p>
            )}
          </form>

          <GoogleButton />

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,.72)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold hover:opacity-80" style={{ color: '#fff' }}>
              Create one
            </Link>
          </p>
          <p className="mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,.66)' }}>
            <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/cookies">Cookies</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Login
