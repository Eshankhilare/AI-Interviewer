import { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewInterview from './pages/NewInterview'
import Interview from './pages/Interview'
import Report from './pages/Report'
import JobDescriptions from './pages/JobDescriptions'
import Resumes from './pages/Resumes'
import Practice from './pages/Practice'
import ProtectedRoute from './components/common/ProtectedRoute'
import Profile from './pages/Profile'
import ErrorBoundary from './components/common/ErrorBoundary'
import { UIChrome, UIPage } from './v2/UISwitch'

const StudioHome = lazy(() => import('./v2/pages/Home'))
const StudioBrief = lazy(() => import('./v2/pages/Brief'))
const StudioLive = lazy(() => import('./v2/pages/StudioLive'))
const StudioReport = lazy(() => import('./v2/pages/ReportStudio'))
const StudioLibrary = lazy(() => import('./v2/pages/Library'))
const StudioSettings = lazy(() => import('./v2/pages/Settings'))
const StudioAuth = lazy(() => import('./v2/pages/Auth'))

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : (
        <UIPage classic={<Login />} studio={<StudioAuth mode="login" />} />
      )} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : (
        <UIPage classic={<Register />} studio={<StudioAuth mode="register" />} />
      )} />
      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <UIChrome />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        }
      >
        {user && (
          <>
            <Route index element={<UIPage classic={<Dashboard />} studio={<StudioHome />} />} />
            <Route path="interview/new" element={<UIPage classic={<NewInterview />} studio={<StudioBrief />} />} />
            <Route path="interview/:id" element={<UIPage classic={<Interview />} studio={<StudioLive />} />} />
            <Route path="report/:id" element={<UIPage classic={<Report />} studio={<StudioReport />} />} />
            <Route path="job-descriptions" element={<UIPage classic={<JobDescriptions />} studio={<StudioLibrary initialTab="jobs" />} />} />
            <Route path="resumes" element={<UIPage classic={<Resumes />} studio={<StudioLibrary initialTab="resumes" />} />} />
            <Route path="practice" element={<UIPage classic={<Practice />} studio={<Practice />} />} />
            <Route path="profile" element={<UIPage classic={<Profile />} studio={<StudioSettings />} />} />
          </>
        )}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global background video - always visible behind all content */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <video
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              filter: 'blur(8px) brightness(1.05) saturate(1.08)',
              transform: 'scale(1.05)',
              pointerEvents: 'none', userSelect: 'none',
            }}
            autoPlay muted loop playsInline disablePictureInPicture aria-hidden="true"
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
          </video>
        </div>
        <ErrorBoundary label="app">
          <AppRoutes />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  )
}

export default App
