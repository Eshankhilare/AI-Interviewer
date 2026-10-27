import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCallback = () => {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const fromHash = window.location.hash.startsWith('#')
      ? new URLSearchParams(window.location.hash.slice(1)).get('token')
      : null
    const fromQuery = new URLSearchParams(window.location.search).get('token')
    const token = fromHash || fromQuery

    if (!token) {
      setFailed(true)
      return
    }

    let alive = true
    loginWithToken(token)
      .then(() => { if (alive) navigate('/', { replace: true }) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [loginWithToken, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <div className="text-center px-6">
        {failed ? (
          <>
            <p className="text-white font-semibold mb-2">Google sign-in did not complete</p>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,.5)' }}>
              The Google account may not have shared a verified email. Try again or use email and password.
            </p>
            <Link to="/login?error=google_failed" className="text-sm font-medium" style={{ color: '#a5b4fc' }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto" />
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>Signing you in…</p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallback
