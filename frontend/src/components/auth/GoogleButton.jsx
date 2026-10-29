import { useEffect, useState } from 'react'
import api, { API_BASE } from '../../services/api'

// Renders only when the backend has GOOGLE_CLIENT_ID/SECRET configured, so no
// dead button appears on deployments without keys.
const GoogleButton = ({ label = 'Continue with Google' }) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let alive = true
    api.get('/auth/providers')
      .then(({ data }) => { if (alive) setEnabled(Boolean(data?.google)) })
      .catch(() => { /* leave the button hidden */ })
    return () => { alive = false }
  }, [])

  if (!enabled) return null

  return (
    <>
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.1)' }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,.66)' }}>or</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.1)' }} />
      </div>
      <a
        href={`${API_BASE}/auth/google`}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all"
        style={{ background: '#fff', color: '#111', border: '1px solid rgba(255,255,255,.2)' }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        {label}
      </a>
    </>
  )
}

export default GoogleButton
