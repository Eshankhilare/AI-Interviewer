import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassInput, BackgroundVideo } from '../components/ui/glass'
import GoogleButton from '../components/auth/GoogleButton'
import { errorMessage } from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', profileSummary: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(formData)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err, 'Registration failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      <BackgroundVideo />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [.22,1,.36,1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <GlassCard className="p-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
            <img src="/logo.jpeg" alt="AI Interviewer" className="w-14 h-14 mx-auto rounded-2xl object-cover mb-4"
              style={{ border: '1px solid rgba(245,158,11,.35)', boxShadow: '0 4px 20px rgba(245,158,11,.3)' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#fff', fontWeight: 500 }}>Create your account</h2>
            <p className="mt-1" style={{ color: 'rgba(255,255,255,.76)' }}>Start practicing interviews with AI</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)' }}>
              <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput type="text" required name="fullName" value={formData.fullName} onChange={handleChange} className="pl-10" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput type="email" required name="email" value={formData.email} onChange={handleChange} className="pl-10" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput type="password" required name="password" minLength={8} value={formData.password} onChange={handleChange} className="pl-10" placeholder="At least 8 characters" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,.6)' }}>Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(255,255,255,.64)' }} />
                <GlassInput type="tel" name="phone" value={formData.phone} onChange={handleChange} className="pl-10" placeholder="+1 234 567 8900" />
              </div>
              <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,.7)' }}>
                You can sign in with this number and your password. It is not SMS-verified yet.
              </p>
            </div>

            <WhiteButton type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black" /> : <><UserPlus className="h-4 w-4" /> Create account</>}
            </WhiteButton>
          </form>

          <GoogleButton label="Sign up with Google" />

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,.72)' }}>
            Already have an account? <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#fff' }}>Sign in</Link>
          </p>
          <p className="mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,.66)' }}>
            <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/cookies">Cookies</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default Register
