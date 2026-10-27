import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Plus, Clock, CheckCircle, XCircle, TrendingUp, BarChart3, Brain, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard, WhiteButton, GlassBadge, BackgroundVideo } from '../components/ui/glass'
import { useAuth } from '../context/AuthContext'
import { dueItems, loadSchedule, subscribeSchedule } from '../utils/spacedRepetition'
import { currentStreak, sessionsThisWeek } from '../utils/progressStats'

const Dashboard = () => {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => { fetchInterviews() }, [])

  useEffect(() => {
    const refresh = () => setDueCount(dueItems(loadSchedule(user)).length)
    refresh()
    return subscribeSchedule(refresh)
  }, [user])

  const fetchInterviews = async () => {
    try { const r = await api.get('/interviews'); setInterviews(r.data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const scored = interviews.filter(i => i.status === 'COMPLETED' && typeof i.overallScore === 'number')
  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === 'COMPLETED').length,
    inProgress: interviews.filter(i => i.status === 'IN_PROGRESS').length,
    avgScore: scored.length > 0
      ? Math.round(scored.reduce((a, i) => a + i.overallScore, 0) / scored.length) : null,
  }

  const getStatusIcon = (s) => {
    if (s === 'COMPLETED') return <CheckCircle className="h-5 w-5" style={{ color: '#4ade80' }} />
    if (s === 'IN_PROGRESS') return <Clock className="h-5 w-5" style={{ color: '#fbbf24' }} />
    if (s === 'CANCELLED') return <XCircle className="h-5 w-5" style={{ color: '#f87171' }} />
    return <Clock className="h-5 w-5" style={{ color: 'rgba(255,255,255,.3)' }} />
  }

  const getStatusVariant = (s) => {
    if (s === 'COMPLETED') return 'success'
    if (s === 'IN_PROGRESS') return 'warning'
    if (s === 'CANCELLED') return 'danger'
    return 'default'
  }

  const streak = currentStreak(interviews)
  const weekly = sessionsThisWeek(interviews)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid rgba(255,255,255,.1)', borderTopColor: '#fff' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ background: "#000", isolation: "isolate" }}>
      <BackgroundVideo />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold" style={{ color: '#fff', fontFamily: '"Reference Display", serif', fontWeight: 500 }}>Dashboard</h1>
            <p className="mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>Track your interview progress</p>
            {interviews.length > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>
                <Flame className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} />
                {streak > 0 ? `${streak}-day streak` : 'Start a streak today'} · {weekly} session{weekly === 1 ? '' : 's'} this week
              </p>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/interview/new">
              <WhiteButton className="px-5 py-2.5 flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" /> New Interview
              </WhiteButton>
            </Link>
          </motion.div>
        </div>

        {/* Spaced repetition */}
        {dueCount > 0 && (
          <Link to="/practice" className="block mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: 'rgba(251,191,36,.12)' }}>
                    <Brain className="h-5 w-5" style={{ color: '#fbbf24' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                      {dueCount} question{dueCount === 1 ? '' : 's'} due for review
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>
                      Spaced repetition from your reports — ten minutes now saves an hour later.
                    </p>
                  </div>
                </div>
                <span className="text-sm flex-shrink-0" style={{ color: '#a5b4fc' }}>Practice →</span>
              </div>
            </GlassCard>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: BarChart3 },
            { label: 'Completed', value: stats.completed, icon: CheckCircle },
            { label: 'In Progress', value: stats.inProgress, icon: Clock },
            { label: 'Avg Score', value: stats.avgScore === null ? '—' : `${stats.avgScore}%`, icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-5">
                <stat.icon className="h-5 w-5 mb-3" style={{ color: 'rgba(255,255,255,.35)' }} />
                <p className="text-2xl font-bold" style={{ color: '#fff' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Interview List */}
        {interviews.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="text-center py-16">
              <Clock className="mx-auto h-10 w-10 mb-4" style={{ color: 'rgba(255,255,255,.15)' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>No interviews yet</h3>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,.4)' }}>Create your first interview to get started</p>
              <Link to="/interview/new"><WhiteButton className="px-5 py-2.5 inline-flex items-center gap-2 text-sm"><Plus className="h-4 w-4" /> Create Interview</WhiteButton></Link>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview, i) => (
              <motion.div key={interview.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}>
                  <GlassCard className="p-5 group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate" style={{ color: '#fff' }}>{interview.title}</h3>
                        <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,.4)' }}>
                          {interview.companyName} — {interview.jobDescriptionTitle}
                        </p>
                      </div>
                      {getStatusIcon(interview.status)}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <GlassBadge variant={getStatusVariant(interview.status)}>{interview.status.replace('_', ' ')}</GlassBadge>
                      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.3)' }}>
                        {interview.currentQuestionIndex}/{interview.totalQuestions}
                      </span>
                    </div>
                    {interview.totalQuestions > 0 && (
                      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.09)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(interview.currentQuestionIndex / interview.totalQuestions) * 100}%`, background: interview.status === 'COMPLETED' ? '#34d399' : '#6366f1' }} />
                      </div>
                    )}
                    <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,.25)' }}>
                      {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
