import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Sparkles, Target } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BarRow, PageHead, ScoreRing, SkeletonBlock, formatDate, gradeClass, scoreColor } from '../ui'
import AnswerInsights from '../../components/interview/AnswerInsights'
import { analyzeAnswer } from '../../utils/answerInsights'

const PDFReportGenerator = lazy(() => import('../../components/report/PDFReportGenerator'))

const PRACTICE = {
  Relevance: 'Answer the question that was asked in the first sentence, then support it.',
  'Technical Depth': 'Add one mechanism and one trade-off — not just the definition.',
  Correctness: 'State assumptions. Avoid confident claims you cannot defend.',
  Clarity: 'Use context → action → result. One idea per paragraph.',
  Evidence: 'Quote a concrete number, tool or outcome from your own work.',
  'Technical': 'Explain how it works under load, not only what it is.',
}

const asArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }
  return []
}

export default function ReportStudio() {
  const { id } = useParams()
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [interview, setInterview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      api.get(`/reports/${id}`),
      api.get(`/interviews/${id}`).catch(() => ({ data: null })),
    ]).then(([reportRes, interviewRes]) => {
      if (!alive) return
      setReport(reportRes.data)
      setInterview(interviewRes.data)
    }).catch(() => {
      if (alive) setError('This report is not available yet. Finish the interview first.')
    })
    return () => { alive = false }
  }, [id])

  const rubric = useMemo(() => asArray(report?.skillRadarData), [report])
  const categories = useMemo(() => asArray(report?.categoryScores), [report])
  const questions = useMemo(() => asArray(report?.questionBreakdown), [report])
  const strengths = asArray(report?.strengths)
  const weaknesses = asArray(report?.weaknesses)
  const weakest = [...rubric].sort((a, b) => a.score - b.score).slice(0, 3)

  if (error) {
    return (
      <div className="st-content st-narrow">
        <div className="st-banner st-banner-bad">{error}</div>
        <Link to="/" className="st-btn" style={{ marginTop: 14 }}><ArrowLeft size={14} /> Back to Today</Link>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="st-content st-narrow">
        <SkeletonBlock height={34} width={280} />
        <div style={{ height: 20 }} />
        <SkeletonBlock height={220} />
      </div>
    )
  }

  return (
    <div className="st-content st-narrow">
      <div className="st-between" style={{ marginBottom: 18 }}>
        <Link to="/" className="st-btn st-btn-ghost st-btn-sm"><ArrowLeft size={14} /> Today</Link>
        <Suspense fallback={null}>
          <PDFReportGenerator report={report} interview={interview} candidate={user} />
        </Suspense>
      </div>

      <div className="st-report-hero st-report-head">
        <div>
          <p className="st-eyebrow" style={{ margin: 0 }}>Assessment summary</p>
          <h1 className="st-display" style={{ marginTop: 8, fontSize: 'clamp(26px, 3vw, 34px)' }}>
            {interview?.title || 'Interview report'}
          </h1>
          <p className="st-sub">
            {[interview?.jobDescriptionTitle, interview?.companyName].filter(Boolean).join(' · ') || 'Practice session'}
            {report.createdAt ? ` · ${formatDate(report.createdAt)}` : ''}
          </p>
          <div className="st-row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
            <span className="st-chip st-chip-accent"><Sparkles size={12} /> {report.recommendationLevel || 'NOT ENOUGH DATA'}</span>
            <span className="st-chip"><Target size={12} /> {questions.length} question{questions.length === 1 ? '' : 's'}</span>
            {rubric.length > 0 && <span className="st-chip"><BookOpen size={12} /> 5-criterion rubric</span>}
          </div>
        </div>
        <div className="st-row" style={{ gap: 18 }}>
          <ScoreRing value={report.overallScore} />
          <div>
            <span className={gradeClass(report.overallScore)} style={{ fontSize: 14, height: 32 }}>{report.overallGrade || 'N/A'}</span>
            <p className="st-dim" style={{ margin: '8px 0 0', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.1em' }}>Overall grade</p>
          </div>
        </div>
      </div>

      <section className="st-card" style={{ marginTop: 16 }}>
        <h2 className="st-h2">Verdict</h2>
        <p className="st-pre" style={{ marginTop: 10, color: 'var(--st-text)', fontSize: 14 }}>
          {report.summary || 'No summary was recorded.'}
        </p>
        {strengths.length > 0 && (
          <div className="st-evidence" style={{ marginTop: 16 }}>
            {strengths.slice(0, 3).map((strength, index) => (
              <div className="st-evidence-item" key={index}>
                <b>Strength {index + 1}</b>
                {String(strength)}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="st-grid-2" style={{ marginTop: 16 }}>
        <section className="st-card">
          <div className="st-between">
            <h2 className="st-h2">Rubric</h2>
            <span className="st-chip">Computed from answers</span>
          </div>
          {rubric.length ? (
            <>
              <div style={{ height: 250, margin: '10px -10px 6px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={rubric} margin={{ top: 12, right: 60, bottom: 12, left: 60 }} outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,.12)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#a9adb8', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#a78bfa" fill="#7c6cf6" fillOpacity={0.32} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="st-stack" style={{ gap: 14 }}>
                {rubric.map((criterion) => (
                  <BarRow key={criterion.skill} label={criterion.skill} value={criterion.score} />
                ))}
              </div>
            </>
          ) : (
            <p className="st-sub" style={{ marginTop: 12 }}>
              No per-criterion data. This happens when an answer was scored by the keyword fallback instead of the rubric model — the score is still real, but it is coarser.
            </p>
          )}
        </section>

        <section className="st-card">
          <div className="st-between">
            <h2 className="st-h2">By category</h2>
            <span className="st-chip">Question type</span>
          </div>
          {categories.length ? (
            <div className="st-stack" style={{ marginTop: 16, gap: 14 }}>
              {categories.map((category) => (
                <BarRow key={category.category} label={category.category} value={category.score} />
              ))}
            </div>
          ) : (
            <p className="st-sub" style={{ marginTop: 12 }}>No category scores recorded.</p>
          )}

          {weaknesses.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p className="st-label" style={{ color: 'var(--st-warn)' }}>Areas for improvement</p>
              <ul className="st-pre" style={{ paddingLeft: 18 }}>
                {weaknesses.slice(0, 3).map((item, index) => <li key={index} style={{ marginBottom: 6 }}>{String(item)}</li>)}
              </ul>
            </div>
          )}
        </section>
      </div>

      {weakest.length > 0 && (
        <section className="st-card" style={{ marginTop: 16 }}>
          <div className="st-between">
            <h2 className="st-h2">Practice plan</h2>
            <Link to="/interview/new" className="st-btn st-btn-sm">Run a focused drill</Link>
          </div>
          <div className="st-grid-3" style={{ marginTop: 16 }}>
            {weakest.map((skill) => (
              <div className="st-evidence-item" key={skill.skill}>
                <b style={{ color: scoreColor(skill.score) }}>{skill.skill} · {skill.score}</b>
                {PRACTICE[skill.skill] || 'Target this dimension in the next session and compare the score.'}
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 20 }}>
        <div className="st-between" style={{ marginBottom: 12 }}>
          <h2 className="st-h2">Question review</h2>
          <span className="st-chip">{questions.length} answer{questions.length === 1 ? '' : 's'}</span>
        </div>

        {questions.length ? questions.map((item, index) => (
          <details className="st-accordion" key={index} open={index === 0}>
            <summary>
              <span className="st-row" style={{ minWidth: 0 }}>
                <span className="st-chip">{index + 1}</span>
                <span style={{ color: 'var(--st-text)', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.question}
                </span>
              </span>
              <span className={gradeClass(item.score)}>{item.score ?? '—'}</span>
            </summary>
            <div className="st-accordion-body">
              <div>
                <p className="st-label">Your answer</p>
                <p className="st-pre">{item.answer || 'No answer recorded.'}</p>
              </div>
              {item.feedback && (
                <div>
                  <p className="st-label">Review</p>
                  <p className="st-pre">{item.feedback}</p>
                </div>
              )}
              {item.answer && (
                <AnswerInsights
                  insights={analyzeAnswer({ text: item.answer, behavioral: item.questionType === 'BEHAVIORAL' })}
                  behavioral={item.questionType === 'BEHAVIORAL'}
                  compact
                />
              )}
              {item.expectedAnswer && (
                <details>
                  <summary className="st-dim" style={{ cursor: 'pointer', fontSize: 12.5 }}>Expected answer</summary>
                  <p className="st-pre" style={{ marginTop: 8 }}>{item.expectedAnswer}</p>
                </details>
              )}
              {item.sampleResponse && (
                <details>
                  <summary className="st-dim" style={{ cursor: 'pointer', fontSize: 12.5 }}>Stronger sample answer</summary>
                  <p className="st-pre" style={{ marginTop: 8 }}>{item.sampleResponse}</p>
                </details>
              )}
            </div>
          </details>
        )) : (
          <div className="st-card"><p className="st-sub">No per-question review was recorded.</p></div>
        )}
      </section>
    </div>
  )
}
