import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Play, Sparkles, Target, TrendingUp, BarChart3, Award } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BarRow, Empty, PageHead, ScoreRing, SkeletonBlock, formatDate } from '../ui'

const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: .55, delay, ease: [.16, 1, .3, 1] },
})

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const { data } = await api.get('/interviews')
        if (!alive) return
        setInterviews(data)
        const newest = [...data]
          .filter((i) => i.status === 'COMPLETED' && typeof i.overallScore === 'number')
          .sort(byNewest)[0]
        if (newest) {
          try {
            const res = await api.get(`/reports/${newest.id}`)
            if (alive) setReport(res.data)
          } catch {
            /* report unavailable — the summary stays honest */
          }
        }
      } catch {
        if (alive) setInterviews([])
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const scored = useMemo(
    () => (interviews || [])
      .filter((i) => i.status === 'COMPLETED' && typeof i.overallScore === 'number')
      .sort(byNewest),
    [interviews],
  )
  const readiness = scored.length
    ? Math.round(scored.slice(0, 3).reduce((sum, i) => sum + i.overallScore, 0) / Math.min(scored.length, 3))
    : null
  const best = scored.reduce((top, i) => (i.overallScore > (top?.overallScore ?? -1) ? i : top), null)
  const trend = [...scored].slice(0, 8).reverse().map((i) => i.overallScore)
  const active = (interviews || []).find((i) => i.status === 'IN_PROGRESS')
  const scheduled = (interviews || []).find((i) => i.status === 'SCHEDULED')
  const resume = active || scheduled

  const skills = Array.isArray(report?.skillRadarData) ? report.skillRadarData : []
  const weakest = [...skills].sort((a, b) => a.score - b.score).slice(0, 3)
  const firstName = (user?.fullName || 'there').split(' ')[0]

  if (interviews === null) {
    return (
      <div className="st-content">
        <SkeletonBlock height={38} width={280} />
        <div style={{ height: 18 }} />
        <SkeletonBlock height={260} />
        <div style={{ height: 18 }} />
        <SkeletonBlock height={140} />
      </div>
    )
  }

  return (
    <div className="st-content">
      <PageHead
        eyebrow="Interview studio"
        title={`Good to see you, ${firstName}.`}
        sub="Your readiness, the next drill that matters, and every session you have run — in one calm place."
        actions={
          <Link to="/interview/new" className="st-btn st-btn-primary">
            <Play size={15} /> Start a session
          </Link>
        }
      />

      <motion.section className="st-hero" {...rise()}>
        <div className="st-hero-inner">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 22 }}>
            <div>
              <p className="st-eyebrow" style={{ margin: 0 }}>{resume ? 'Continue' : 'The next round'}</p>
              <h2 className="st-display" style={{ fontSize: 'clamp(26px, 2.6vw, 34px)', marginTop: 10 }}>
                {resume ? resume.title : 'Walk in already warmed up.'}
              </h2>
              <p className="st-sub" style={{ maxWidth: 540 }}>
                {resume
                  ? `${resume.jobDescriptionTitle || 'Interview'} · question ${(resume.currentQuestionIndex || 0) + 1} of ${resume.totalQuestions}. Your answers so far are saved.`
                  : 'Adaptive questions, a five-criterion rubric, and a report that quotes your own answers. Fifteen minutes, no scheduling.'}
              </p>
              <div className="st-row" style={{ marginTop: 18, flexWrap: 'wrap' }}>
                {resume ? (
                  <span className="st-chip st-chip-warn"><Clock size={12} /> In progress</span>
                ) : (
                  <>
                    <span className="st-chip st-chip-accent"><Sparkles size={12} /> Adaptive follow-ups</span>
                    <span className="st-chip"><Target size={12} /> Rubric scoring</span>
                    <span className="st-chip"><BarChart3 size={12} /> Evidence checked</span>
                  </>
                )}
              </div>
            </div>
            <div className="st-row" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                className="st-btn st-btn-primary st-btn-lg"
                onClick={() => navigate(resume ? `/interview/${resume.id}` : '/interview/new')}
              >
                {resume ? 'Resume session' : 'Start a session'} <ArrowRight size={16} />
              </button>
              {report && (
                <Link to={`/report/${report.interviewId}`} className="st-btn st-btn-lg">Open last report</Link>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <div style={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.28), transparent 65%)', filter: 'blur(6px)' }} />
              <ScoreRing value={readiness} size={156} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="st-eyebrow" style={{ margin: 0 }}>Readiness</p>
              <p className="st-sub" style={{ marginTop: 6, maxWidth: 190 }}>
                {readiness == null
                  ? 'One session sets the baseline.'
                  : readiness >= 70
                    ? 'Strong signal. Move to the harder tier.'
                    : readiness >= 50
                      ? 'Solid core. Sharpen the evidence.'
                      : 'Early signal. Target the weakest criteria.'}
              </p>
              <div className="st-trend" aria-hidden="true" style={{ marginTop: 12 }}>
                {(trend.length ? trend : [12, 22, 18, 30, 26, 38]).map((value, index) => (
                  <span key={index} style={{ height: `${Math.max(8, value)}%`, opacity: trend.length ? 1 : 0.3 }} />
                ))}
              </div>
              <p className="st-dim" style={{ fontSize: 11.5, margin: '8px 0 0' }}>
                {scored.length ? `Last ${Math.min(scored.length, 3)} session${Math.min(scored.length, 3) === 1 ? '' : 's'}` : 'No completed sessions yet'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div className="st-stat-grid" style={{ marginTop: 18 }} {...rise(.08)}>
        <div className="st-stat"><strong>{interviews.length}</strong><span>Sessions</span></div>
        <div className="st-stat"><strong>{scored.length}</strong><span>Reports</span></div>
        <div className="st-stat"><strong>{best ? `${best.overallScore} · ${best.overallGrade}` : '—'}</strong><span>Best result</span></div>
        <div className="st-stat"><strong>{active ? '1' : '0'}</strong><span>In progress</span></div>
      </motion.div>

      <motion.div className="st-grid-2" style={{ marginTop: 18 }} {...rise(.14)}>
        <section className="st-card">
          <div className="st-between">
            <h2 className="st-h2">Focus next</h2>
            <span className="st-chip">{report ? 'From your last report' : 'Awaiting a report'}</span>
          </div>
          <div style={{ marginTop: 16 }}>
            {weakest.length ? (
              <>
                {weakest.map((skill) => (
                  <BarRow key={skill.skill} label={skill.skill} value={skill.score} />
                ))}
                <div className="st-row" style={{ marginTop: 18 }}>
                  <Link
                    to={`/interview/new?count=5&focus=${encodeURIComponent(weakest[0].skill)}`}
                    className="st-btn st-btn-sm st-btn-primary"
                  >
                    Drill {weakest[0].skill.toLowerCase()} <ArrowRight size={13} />
                  </Link>
                  <Link to={`/report/${report?.interviewId}`} className="st-btn st-btn-ghost st-btn-sm">See evidence</Link>
                </div>
              </>
            ) : (
              <Empty
                icon={Target}
                title="No rubric data yet"
                action={<Link to="/interview/new" className="st-btn st-btn-sm">Run a session</Link>}
              >
                Skill gaps appear here after a scored interview.
              </Empty>
            )}
          </div>
        </section>

        <section className="st-card">
          <div className="st-between">
            <h2 className="st-h2">Recent sessions</h2>
            <Link to="/interview/new" className="st-btn st-btn-ghost st-btn-sm">New</Link>
          </div>
          {interviews.length ? (
            <div style={{ marginTop: 6 }}>
              {interviews.slice(0, 4).map((interview) => (
                <div className="st-list-item" key={interview.id}>
                  <div className="st-row" style={{ minWidth: 0 }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      display: 'grid', placeItems: 'center',
                      background: interview.status === 'COMPLETED' ? 'rgba(74,222,128,.10)' : 'rgba(251,191,36,.10)',
                      border: `1px solid ${interview.status === 'COMPLETED' ? 'rgba(74,222,128,.25)' : 'rgba(251,191,36,.25)'}`,
                    }}>
                      {interview.status === 'COMPLETED' ? <Award size={15} style={{ color: 'var(--st-ok)' }} /> : <Clock size={15} style={{ color: 'var(--st-warn)' }} />}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <Link to={interview.status === 'COMPLETED' ? `/report/${interview.id}` : `/interview/${interview.id}`}
                        style={{ color: 'var(--st-text)', textDecoration: 'none', fontWeight: 550, fontSize: 13.5 }}>
                        {interview.title}
                      </Link>
                      <p className="st-dim" style={{ margin: '3px 0 0', fontSize: 12 }}>
                        {interview.jobDescriptionTitle || 'Interview'} · {formatDate(interview.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={interview.status === 'COMPLETED' ? 'st-chip st-chip-ok' : 'st-chip st-chip-warn'}>
                    {interview.status === 'COMPLETED' ? `${interview.overallScore ?? '—'} · ${interview.overallGrade || '—'}` : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="No sessions yet" action={<Link to="/interview/new" className="st-btn st-btn-sm">Create the first one</Link>}>
              Your sessions and reports will live here.
            </Empty>
          )}
        </section>
      </motion.div>
    </div>
  )
}
