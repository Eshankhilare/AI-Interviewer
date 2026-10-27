import { useEffect, useRef, useState } from 'react'
import { CalendarClock, Download, RotateCcw, Trash2, Upload, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlassCard, GlassBadge, WhiteButton } from '../components/ui/glass'
import PracticeDrill from '../components/practice/PracticeDrill'
import {
  dueItems,
  exportSchedule,
  gradePracticeItem,
  importSchedule,
  loadSchedule,
  removeFromPractice,
  saveSchedule,
  subscribeSchedule,
  upcomingItems,
} from '../utils/spacedRepetition'

const when = (iso) => {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'due now'
  const days = Math.round(diff / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'later today'
  return days === 1 ? 'tomorrow' : `in ${days} days`
}

const Practice = () => {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState({ version: 1, items: {} })
  const [selectedKey, setSelectedKey] = useState(null)
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    const refresh = () => setSchedule(loadSchedule(user))
    refresh()
    setSelectedKey(null)
    return subscribeSchedule(refresh)
  }, [user])

  const persist = (next) => {
    setSchedule(next)
    saveSchedule(user, next)
  }

  const due = dueItems(schedule)
  const upcoming = upcomingItems(schedule)
  const selected = selectedKey ? schedule.items[selectedKey] : null

  const grade = (id) => {
    if (!selectedKey) return
    persist(gradePracticeItem(schedule, selectedKey, id))
  }

  const remove = (key) => {
    persist(removeFromPractice(schedule, key))
    if (selectedKey === key) setSelectedKey(null)
  }

  const exportAll = () => {
    const blob = new Blob([exportSchedule(schedule)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'practice-queue.json'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Queue exported.')
  }

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const imported = importSchedule(await file.text())
    if (!imported) {
      setNotice('That file is not a practice queue.')
      return
    }
    persist(imported)
    setSelectedKey(null)
    setNotice(`Imported ${Object.keys(imported.items).length} question(s).`)
  }

  const resetQueue = () => {
    if (!window.confirm('Clear every scheduled question? This cannot be undone.')) return
    persist({ version: 1, items: {} })
    setSelectedKey(null)
    setNotice('Queue cleared.')
  }

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <PracticeDrill
          item={selected}
          onGrade={grade}
          onBack={() => setSelectedKey(null)}
        />
      </div>
    )
  }

  const Row = ({ item, dueNow }) => (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {item.score != null && <GlassBadge variant="warning">{item.score}/100</GlassBadge>}
            <GlassBadge variant="default">{item.questionType || 'QUESTION'}</GlassBadge>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>{item.sourceTitle || 'Saved question'}</span>
          </div>
          <p className="text-sm font-medium" style={{ color: '#fff' }}>{item.question}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>
            {dueNow ? 'Due now' : `Due ${when(item.dueAt)}`} · {item.reps} review{item.reps === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <WhiteButton onClick={() => setSelectedKey(item.key)} className="px-3 py-1.5 text-xs">
            Practice
          </WhiteButton>
          <button onClick={() => remove(item.key)} aria-label="Remove from practice" title="Remove from practice"
            className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,.3)' }}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </GlassCard>
  )

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Practice queue</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>
          Questions you chose to revisit, on a spaced schedule. Self-graded — no model call, nothing leaves this browser.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button type="button" onClick={exportAll} disabled={Object.keys(schedule.items).length === 0}
            className="chip-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="chip-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
          <button type="button" onClick={resetQueue} disabled={Object.keys(schedule.items).length === 0}
            className="chip-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs disabled:opacity-40">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          {notice && <span className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>{notice}</span>}
        </div>
      </div>

      {due.length === 0 && upcoming.length === 0 ? (
        <GlassCard className="text-center py-12" hover={false}>
          <CalendarClock className="mx-auto h-10 w-10 mb-4" style={{ color: 'rgba(255,255,255,.2)' }} />
          <h2 className="text-base font-semibold mb-2" style={{ color: '#fff' }}>Nothing scheduled yet</h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,.45)' }}>
            Open a finished report and choose <span style={{ color: '#a5b4fc' }}>Practice this question</span>.
            It comes back in 10 minutes, 2 days, then at growing intervals.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" style={{ color: '#fbbf24' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.7)' }}>
                Due now ({due.length})
              </h2>
            </div>
            {due.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,.35)' }}>Nothing due. The next batch is below.</p>
            ) : (
              <div className="space-y-3">{due.map((item) => <Row key={item.key} item={item} dueNow />)}</div>
            )}
          </section>

          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="h-4 w-4" style={{ color: 'rgba(255,255,255,.4)' }} />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>
                  Scheduled ({upcoming.length})
                </h2>
              </div>
              <div className="space-y-3">{upcoming.map((item) => <Row key={item.key} item={item} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default Practice
