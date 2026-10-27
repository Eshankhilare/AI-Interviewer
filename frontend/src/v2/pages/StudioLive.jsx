import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, Camera, CheckCircle2, Clock, Code, MessageSquare, Mic, Send, Shield, Square,
} from 'lucide-react'
import api, { errorMessage } from '../../services/api'
import VoiceRecorder from '../../components/interview/VoiceRecorder'
import CodingEnvironment from '../../components/interview/CodingEnvironment'
import BodyLanguageAnalyzer from '../../components/interview/BodyLanguageAnalyzer'
import ProctoringMonitor from '../../components/interview/ProctoringMonitor'
import AnswerInsights from '../../components/interview/AnswerInsights'
import LiveAnswerHints from '../../components/interview/LiveAnswerHints'
import EvaluationProgress from '../../components/interview/EvaluationProgress'
import CrystalizedBall from '../../components/ui/CrystalizedBall'
import { useBackground } from '../store'
import { analyzeAnswer } from '../../utils/answerInsights'
import { ScoreRing, SkeletonBlock } from '../ui'

const formatClock = (seconds) => {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

export default function StudioLive() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [mode, setMode] = useState('text')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [signalsOpen, setSignalsOpen] = useState(false)
  const [proctoringOn, setProctoringOn] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [deadline, setDeadline] = useState(null)
  const audioRef = useRef(null)
  const reduce = useReducedMotion()
  const { background } = useBackground()

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`)
        if (!alive) return
        if (data.status === 'COMPLETED') {
          navigate(`/report/${id}`, { replace: true })
          return
        }
        if (data.status === 'SCHEDULED') await api.post(`/interviews/${id}/begin`)
        const next = await api.get(`/interviews/${id}/next-question`)
        if (!alive) return
        setInterview(data)
        setQuestion(next.data)
        const seconds = (data.durationMinutes || 60) * 60
        setRemaining(seconds)
        setDeadline(Date.now() + seconds * 1000)
      } catch (err) {
        if (alive) setError(errorMessage(err, 'Could not load this session. Retry in a moment.'))
      }
    }
    load()
    return () => {
      alive = false
      audioRef.current?.getTracks?.().forEach((track) => track.stop())
    }
  }, [id, navigate])

  useEffect(() => {
    if (!deadline) return undefined
    const tick = () => setRemaining(Math.max(0, Math.round((deadline - Date.now()) / 1000)))
    const timer = setInterval(tick, 1000)
    tick()
    return () => clearInterval(timer)
  }, [deadline])

  const isCoding = question?.questionType === 'CODING'
  const activeMode = isCoding ? 'coding' : mode
  const total = interview?.totalQuestions || 10
  const index = (interview?.currentQuestionIndex || 0) + 1
  const progress = Math.min(100, Math.round((index / total) * 100))

  const submit = async () => {
    if (!answer.trim() || submitting || feedback) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, {
        sessionId: question.id,
        answer,
      })
      const evaluation = data?.evaluation
      const asText = (value) => (Array.isArray(value) ? value.join(' ') : value)
      setFeedback(evaluation
        ? {
          score: evaluation.score,
          grade: evaluation.grade,
          feedback: evaluation.feedback,
          strengths: asText(evaluation.strengths),
          weaknesses: asText(evaluation.weaknesses),
          sampleResponse: evaluation.sampleResponse,
          insights: analyzeAnswer({
            text: answer,
            behavioral: question?.questionType === 'BEHAVIORAL',
          }),
        }
        : {
          score: null,
          grade: null,
          feedback: 'Answer saved, but the evaluator was unavailable. The report will say so instead of inventing a score.',
          insights: analyzeAnswer({
            text: answer,
            behavioral: question?.questionType === 'BEHAVIORAL',
          }),
        })
      if (interview) {
        setInterview((current) => ({
          ...current,
          sessions: (current.sessions || []).map((session) => (
            session.id === question.id ? { ...session, candidateAnswer: answer, evaluation: { score: evaluation?.score } } : session
          )),
        }))
      }
    } catch (err) {
      setError(errorMessage(err, 'Your answer was not saved. Please retry.'))
    } finally {
      setSubmitting(false)
    }
  }

  const next = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      if (index >= total) {
        await api.post(`/interviews/${id}/end`)
        navigate(`/report/${id}`)
        return
      }
      const { data } = await api.get(`/interviews/${id}/next-question`)
      setInterview((current) => ({ ...current, currentQuestionIndex: index }))
      setQuestion(data)
      setAnswer('')
      setFeedback(null)
      setMode('text')
    } catch (err) {
      setError(errorMessage(err, 'Could not load the next question. Please retry.'))
    } finally {
      setSubmitting(false)
    }
  }

  const end = async () => {
    try {
      await api.post(`/interviews/${id}/end`)
      navigate(`/report/${id}`)
    } catch (err) {
      setError(errorMessage(err, 'Could not end the session. Please retry.'))
    }
  }

  const onTranscript = (transcript, final) => {
    if (final) setAnswer((prev) => `${prev} ${transcript}`.trim())
  }

  const onRecording = async (recording) => {
    if (recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioRef.current = stream
      } catch {
        setError('Microphone access was denied. You can type the answer instead.')
      }
    } else {
      audioRef.current?.getTracks?.().forEach((track) => track.stop())
      audioRef.current = null
    }
  }

  if (!interview || !question) {
    return (
      <div className="st-content">
        {error ? (
          <div className="st-banner st-banner-bad">{error}</div>
        ) : (
          <>
            <SkeletonBlock height={30} width={220} />
            <div style={{ height: 18 }} />
            <SkeletonBlock height={260} />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="st-content">
      <div className="st-between" style={{ marginBottom: 16 }}>
        <div>
          <p className="st-eyebrow" style={{ margin: 0 }}>Live session</p>
          <h1 className="st-h2" style={{ marginTop: 4, fontSize: 20 }}>{interview.title}</h1>
          <p className="st-dim" style={{ margin: '3px 0 0', fontSize: 12.5 }}>
            {interview.jobDescriptionTitle || 'Interview'} · question {index} of {total}
          </p>
        </div>
        <div className="st-row">
          {remaining != null && (
            <span className="st-chip" style={{ color: remaining < 60 ? 'var(--st-bad)' : undefined }}>
              <Clock size={12} /> {formatClock(remaining)}
            </span>
          )}
          <button type="button" className="st-btn st-btn-ghost st-btn-sm" onClick={() => setConfirmEnd(true)}>
            <Square size={12} /> End
          </button>
        </div>
      </div>

      {confirmEnd && (
        <div className="st-banner st-banner-warn" style={{ marginBottom: 14, alignItems: 'center' }}>
          <span style={{ flex: 1 }}>End now? Answers already submitted are kept; unanswered questions count as skipped.</span>
          <button type="button" className="st-btn st-btn-sm" onClick={() => setConfirmEnd(false)}>Keep going</button>
          <button type="button" className="st-btn st-btn-sm st-btn-primary" onClick={end}>End session</button>
        </div>
      )}

      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.07)', marginBottom: 20 }}>
        <div style={{ width: `${progress}%`, height: '100%', borderRadius: 999, background: 'var(--st-accent)', transition: 'width .3s ease' }} />
      </div>

      {error && <div className="st-banner st-banner-bad" style={{ marginBottom: 14 }}>{error}</div>}

      <div className="st-live">
        <aside className="st-timeline">
          <p className="st-eyebrow" style={{ margin: '0 0 10px' }}>Session map</p>
          {(interview.sessions || []).map((session) => {
            const current = session.id === question.id
            const done = Boolean(session.candidateAnswer || session.evaluation)
            return (
              <div
                key={session.id}
                className={`st-timeline-item${current ? ' is-current' : ''}${done && !current ? ' is-done' : ''}`}
              >
                <span className="st-timeline-dot">{done && !current ? '✓' : session.questionOrder}</span>
                <span>{session.questionText}</span>
              </div>
            )
          })}
          {!(interview.sessions || []).length && (
            <div className="st-timeline-item is-current">
              <span className="st-timeline-dot">{index}</span>
              <span>{question.questionText}</span>
            </div>
          )}
        </aside>

        <section>
          <motion.div
            key={question.id}
            className="st-card"
            style={{ overflow: 'hidden' }}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="st-stage">
              <div className="st-orb-ball" aria-hidden="true">
                <CrystalizedBall
                  preset="plasma"
                  color={background === 'flux' ? '#22D3EE' : '#F59E0B'}
                  size={0.78}
                  crackle={0.85}
                  fill={0.5}
                  speed={0.8}
                  interactive
                  hoverStrength={0.7}
                />
              </div>
              <div>
                <p className="st-eyebrow" style={{ margin: 0 }}>AI interviewer</p>
                <div className="st-row" style={{ gap: 8, marginTop: 4 }}>
                  <div className="st-eq" aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((bar) => (
                      <span key={bar} style={{ animationDelay: `${bar * 0.12}s` }} />
                    ))}
                  </div>
                  <span className="st-dim" style={{ fontSize: 12 }}>
                    {feedback ? 'Feedback ready' : 'Ready when you are'}
                  </span>
                </div>
              </div>
              <div className="st-row" style={{ marginLeft: 'auto', flexWrap: 'wrap', gap: 8 }}>
                <span className="st-chip st-chip-accent">Question {index}</span>
                <span className="st-chip">{question.questionType}</span>
                <span className="st-chip">{question.difficulty}</span>
                {isCoding && <span className="st-chip"><Code size={12} /> Editor</span>}
              </div>
            </div>
            <h2 className="st-question">{question.questionText}</h2>
            {question.aiFollowUp && (
              <div className="st-quote" style={{ marginTop: 14 }}>{question.aiFollowUp}</div>
            )}
          </motion.div>

          <motion.div
            className="st-card"
            style={{ marginTop: 14 }}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {feedback ? (
              <>
                <div className="st-row" style={{ alignItems: 'flex-start', gap: 16 }}>
                  <ScoreRing value={feedback.score} size={84} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="st-row" style={{ flexWrap: 'wrap' }}>
                      <span className="st-chip st-chip-accent">Answer scored</span>
                      {feedback.grade && <span className="st-chip">{feedback.grade}</span>}
                    </div>
                    <p className="st-sub" style={{ marginTop: 8 }}>{feedback.feedback}</p>
                  </div>
                </div>
                {(feedback.strengths || feedback.weaknesses) && (
                  <div className="st-grid-2" style={{ marginTop: 16 }}>
                    {feedback.strengths && (
                      <div>
                        <p className="st-label" style={{ color: 'var(--st-ok)' }}>What worked</p>
                        <p className="st-pre">{String(feedback.strengths)}</p>
                      </div>
                    )}
                    {feedback.weaknesses && (
                      <div>
                        <p className="st-label" style={{ color: 'var(--st-warn)' }}>What to sharpen</p>
                        <p className="st-pre">{String(feedback.weaknesses)}</p>
                      </div>
                    )}
                  </div>
                )}
                {feedback.sampleResponse && (
                  <details style={{ marginTop: 14 }}>
                    <summary className="st-dim" style={{ cursor: 'pointer', fontSize: 12.5 }}>View a stronger sample answer</summary>
                    <p className="st-pre" style={{ marginTop: 8 }}>{feedback.sampleResponse}</p>
                  </details>
                )}
                {feedback.insights && (
                  <div style={{ marginTop: 16 }}>
                    <AnswerInsights
                      insights={feedback.insights}
                      behavioral={question?.questionType === 'BEHAVIORAL'}
                    />
                  </div>
                )}
                <button type="button" className="st-btn st-btn-primary" style={{ marginTop: 18 }} onClick={next} disabled={submitting}>
                  {index >= total ? 'Finish and view report' : 'Next question'} <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <div className="st-composer-tabs">
                  {!isCoding && (
                    <>
                      <button type="button" className={`st-tab${mode === 'text' ? ' is-active' : ''}`} onClick={() => setMode('text')}>
                        <MessageSquare size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} /> Text
                      </button>
                      <button type="button" className={`st-tab${mode === 'voice' ? ' is-active' : ''}`} onClick={() => setMode('voice')}>
                        <Mic size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} /> Voice
                      </button>
                    </>
                  )}
                  {isCoding && (
                    <span className="st-tab is-active"><Code size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} /> Code</span>
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  {activeMode === 'coding' ? (
                    <div style={{ height: 620, margin: '0 -22px -22px', overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
                      <CodingEnvironment
                        problem={{ id: question.id, title: 'Coding challenge', description: question.questionText }}
                        onSubmit={(result) => setAnswer(JSON.stringify(result))}
                      />
                    </div>
                  ) : activeMode === 'voice' ? (
                    <VoiceRecorder onTranscript={onTranscript} onRecordingChange={onRecording} disabled={submitting} />
                  ) : (
                    <textarea
                      className="st-textarea"
                      rows={7}
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Structure the answer: context, what you did, the trade-off, the result."
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit()
                      }}
                    />
                  )}
                </div>

                {!feedback && (
                  <LiveAnswerHints text={answer} question={question?.questionText} behavioral={question?.questionType === 'BEHAVIORAL'} />
                )}

                <div className="st-between" style={{ marginTop: 14 }}>
                  <span className="st-dim" style={{ fontSize: 11.5 }}>
                    Ctrl/⌘ + Enter to submit
                  </span>
                  <button
                    type="button"
                    className="st-btn st-btn-primary"
                    onClick={submit}
                    disabled={!answer.trim() || submitting}
                  >
                    <Send size={14} /> {submitting ? 'Scoring…' : 'Submit answer'}
                  </button>
                </div>
                {submitting && <EvaluationProgress active />}
              </>
            )}
          </motion.div>
        </section>

        <aside className="st-stack" style={{ gap: 14 }}>
          <details className="st-card st-signals" open={signalsOpen} onToggle={(event) => setSignalsOpen(event.currentTarget.open)}>
            <summary>
              <span className="st-row"><Camera size={15} /> Signals</span>
              <span className="st-chip">{signalsOpen ? 'On' : 'Off'}</span>
            </summary>
            <p className="st-dim" style={{ fontSize: 12, lineHeight: 1.55, marginTop: 0 }}>
              Camera analysis is optional and stays off until you press Start. Nothing is uploaded; the pose runs in your browser.
            </p>
            {signalsOpen && (
              <>
                <BodyLanguageAnalyzer enabled onAnalysisUpdate={() => {}} />
                <label className="st-row" style={{ marginTop: 14, fontSize: 12.5, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={proctoringOn}
                    onChange={(event) => setProctoringOn(event.target.checked)}
                    style={{ accentColor: 'var(--st-accent)' }}
                  />
                  Enable proctoring
                </label>
                {proctoringOn && (
                  <div style={{ marginTop: 10 }}>
                    <ProctoringMonitor
                      enabled
                      onViolation={async (violation) => {
                        if (violation.type === 'interview_end') {
                          try { await api.post(`/interviews/${id}/end`) } catch { /* the redirect still happens */ }
                          navigate('/')
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </details>

          <div className="st-card">
            <p className="st-eyebrow" style={{ margin: 0 }}>How scoring works</p>
            <p className="st-sub" style={{ fontSize: 12.5 }}>
              Each answer is scored on relevance, depth, correctness, clarity and evidence. Quotes that are not in your answer are flagged, so the score cannot be inflated by the model.
            </p>
            <div className="st-row" style={{ marginTop: 10 }}>
              <span className="st-chip"><Shield size={12} /> Evidence checked</span>
              <span className="st-chip"><CheckCircle2 size={12} /> Autosaved</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
