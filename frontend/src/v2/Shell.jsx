import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, FolderOpen, Settings, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { setUIVersion } from './store'
import './ui.css'

const TITLES = [
  [/^\/interview\/new/, 'New session'],
  [/^\/interview\//, 'Live session'],
  [/^\/report\//, 'Report'],
  [/^\/(job-descriptions|resumes)/, 'Library'],
  [/^\/profile/, 'Settings'],
  [/^\/$/, 'Today'],
]

const titleFor = (pathname) => {
  const match = TITLES.find(([pattern]) => pattern.test(pathname))
  return match ? match[1] : 'Studio'
}

const NAV = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/interview/new', label: 'New session', icon: Plus },
  { to: '/job-descriptions', label: 'Library', icon: FolderOpen, match: /^\/(job-descriptions|resumes)/ },
  { to: '/profile', label: 'Settings', icon: Settings },
]

export default function StudioShell() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isLive = /^\/interview\//.test(location.pathname) && location.pathname !== '/interview/new'

  return (
    <div className="ui-studio">
      <div className="st-ambient" aria-hidden="true" />
      <div className="st-shell">
        <nav className="st-rail" aria-label="Studio">
          <Link to="/" className="st-rail-logo" aria-label="AI Interviewer home">AI</Link>
          {NAV.map(({ to, label, icon: Icon, end, match }) => {
            const active = match
              ? match.test(location.pathname)
              : end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                data-label={label}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`st-rail-item${active ? ' is-active' : ''}`}
              >
                <Icon size={19} strokeWidth={1.8} />
              </NavLink>
            )
          })}
          <div className="st-rail-spacer" />
          <button
            type="button"
            className="st-rail-item st-rail-logout"
            data-label="Classic UI"
            aria-label="Switch to classic UI"
            onClick={() => setUIVersion('classic')}
          >
            <ArrowLeftRight size={18} strokeWidth={1.8} />
          </button>
          <Link to="/profile" className="st-rail-item" data-label={user?.fullName || 'Account'} aria-label="Account settings">
            <span style={{
              width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center',
              background: 'linear-gradient(135deg,#7c6cf6,#a78bfa)', color: '#fff', fontSize: 11, fontWeight: 700,
            }}>
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </span>
          </Link>
        </nav>

        <div className="st-main">
          <header className="st-topbar">
            <div className="st-crumb">
              <span>Studio</span>
              <span aria-hidden="true">/</span>
              <strong>{titleFor(location.pathname)}</strong>
            </div>
            <div className="st-topbar-actions">
              {!isLive && (
                <button
                  type="button"
                  className="st-btn st-btn-ghost st-btn-sm"
                  onClick={() => setUIVersion('classic')}
                  title="Switch back to the original UI"
                >
                  <ArrowLeftRight size={14} /> <span>Classic UI</span>
                </button>
              )}
              {!isLive && (
                <button type="button" className="st-btn st-btn-primary st-btn-sm" onClick={() => navigate('/interview/new')}>
                  <Plus size={15} /> <span>New session</span>
                </button>
              )}
            </div>
          </header>

          <main id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
