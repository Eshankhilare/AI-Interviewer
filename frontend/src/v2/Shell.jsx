import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, FolderOpen, Settings, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { setUIVersion } from './store'
import { LiquidNavbar } from '../components/ui/liquid-glass-navbar'
import Onboarding, { needsOnboarding } from './Onboarding'
import './ui.css'

const activeIndex = (pathname) => {
  if (pathname === '/') return 0
  if (pathname.startsWith('/interview')) return 1
  if (pathname.startsWith('/report')) return 0
  if (pathname.startsWith('/job-descriptions') || pathname.startsWith('/resumes')) return 2
  if (pathname.startsWith('/profile')) return 3
  return 0
}

export default function StudioShell() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(needsOnboarding)
  const isLive = /^\/interview\//.test(location.pathname) && location.pathname !== '/interview/new'

  const items = [
    { label: 'Today', icon: <Home size={17} strokeWidth={1.9} />, fx: 'glow', href: '/' },
    { label: 'New', icon: <Plus size={17} strokeWidth={1.9} />, fx: 'drop', href: '/interview/new' },
    { label: 'Library', icon: <FolderOpen size={17} strokeWidth={1.9} />, fx: 'spin', href: '/job-descriptions' },
    { label: 'Settings', icon: <Settings size={17} strokeWidth={1.9} />, fx: 'wave', href: '/profile' },
  ]

  return (
    <div className="ui-studio">
      <div className="st-ambient" aria-hidden="true" />

      <header className="st-topbar st-topbar-v2">
        <Link to="/" className="st-brand" aria-label="AI Interviewer home">
          <span className="st-rail-logo" style={{ marginBottom: 0 }}>AI</span>
          <span className="st-brand-name">AI Interviewer</span>
        </Link>

        <div className="st-nav-wrap">
          <LiquidNavbar
            tone="dark"
            items={items}
            active={activeIndex(location.pathname)}
            onChange={(index, item) => { if (item.href) navigate(item.href) }}
            sound={false}
          />
        </div>

        <div className="st-topbar-actions">
          {!isLive && (
            <button
              type="button"
              className="st-btn st-btn-ghost st-btn-sm st-classic-switch"
              onClick={() => setUIVersion('classic')}
              title="Switch back to the original UI"
            >
              <ArrowLeftRight size={14} /> <span>Classic</span>
            </button>
          )}
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      {showIntro && <Onboarding onDone={() => setShowIntro(false)} />}
    </div>
  )
}
