import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Home, Briefcase, FileText, Menu, X, User, ArrowLeftRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { setUIVersion } from '../../v2/store'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/job-descriptions', label: 'Job Descriptions', icon: Briefcase },
    { path: '/resumes', label: 'Resumes', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', isolation: 'isolate' }}>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', overflowY: 'auto' }}>
        {/* Skip link: first tab stop, invisible until focused */}
        <a href="#main-content" className="skip-link">Skip to content</a>

        {/* Header */}
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [.16,1,.3,1] }}
          className="sticky top-0 z-50"
          style={{ background: 'rgba(10,10,10,.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.05)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2.5 group">
                  <img src="/logo.jpeg" alt="AI Interviewer" className="w-8 h-8 rounded-xl object-cover"
                    style={{ border: '1px solid rgba(245,158,11,.35)' }} />
                  <span className="text-lg font-bold" style={{ color: '#fff' }}>Interviewer</span>
                </Link>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-1">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}
                    aria-current={location.pathname === path ? 'page' : undefined}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: location.pathname === path ? '#fff' : 'rgba(255,255,255,.5)', background: location.pathname === path ? 'rgba(255,255,255,.06)' : 'transparent' }}>
                    <Icon className="h-4 w-4 inline mr-1.5" aria-hidden="true" />{label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.7)' }}>{user?.fullName}</span>
                </div>
                <button onClick={() => setUIVersion('studio')} aria-label="Switch to the new studio UI" title="Open the new Studio UI" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200" style={{ color: '#d8d2ff', background: 'rgba(245,158,11,.16)', border: '1px solid rgba(249,115,22,.35)' }}>
                  <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Studio</span>
                </button>
                <button onClick={handleLogout} aria-label="Log out" title="Log out" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200" style={{ color: 'rgba(255,255,255,.72)' }}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-nav" className="sm:hidden p-2 rounded-xl" style={{ color: 'rgba(255,255,255,.76)' }}>
                  {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="sm:hidden overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <div id="mobile-nav" className="px-4 py-3 space-y-1">
                  {navLinks.map(({ path, label, icon: Icon }) => (
                    <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                      aria-current={location.pathname === path ? 'page' : undefined}
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ color: location.pathname === path ? '#fff' : 'rgba(255,255,255,.5)', background: location.pathname === path ? 'rgba(255,255,255,.06)' : 'transparent' }}>
                      <Icon className="h-4 w-4 mr-2" aria-hidden="true" />{label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [.16,1,.3,1] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: 'rgba(255,255,255,.66)' }}>
            <span>© 2026 AI Interviewer</span>
            <Link to="/privacy" className="hover:opacity-80">Privacy</Link>
            <Link to="/terms" className="hover:opacity-80">Terms</Link>
            <Link to="/cookies" className="hover:opacity-80">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
