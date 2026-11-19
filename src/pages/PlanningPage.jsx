import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlanningTasks } from '../api/leads'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { humanize } from '../utils/formatters'

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(value, amount) {
  const date = new Date(value)
  date.setDate(date.getDate() + amount)
  return date
}

function startOfWeek(value) {
  const date = startOfDay(value)
  const offset = date.getDay() === 0 ? -6 : 1 - date.getDay()
  return addDays(date, offset)
}

function dateKey(value) {
  const date = new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function calendarDays(anchor, view) {
  if (view === 'week') {
    const first = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, index) => addDays(first, index))
  }

  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const first = startOfWeek(firstOfMonth)
  return Array.from({ length: 42 }, (_, index) => addDays(first, index))
}

function periodTitle(anchor, view) {
  if (view === 'month') return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(anchor)
  const first = startOfWeek(anchor)
  const last = addDays(first, 6)
  return `${new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(first)} – ${new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(last)}`
}

function TaskItem({ task }) {
  const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(task.due_at))
  return (
    <Link className={`planning-task planning-task-${task.type}`} to={`/leads/${task.lead_id}`}>
      <span>{time} · {humanize(task.type)}</span>
      <strong>{task.contact_name}</strong>
      <small>{task.title}</small>
    </Link>
  )
}

export function PlanningPage() {
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [state, setState] = useState({ loading: true, data: [], error: null })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      setState({ loading: false, data: await getPlanningTasks(), error: null })
    } catch (error) {
      setState({ loading: false, data: [], error })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const days = useMemo(() => calendarDays(anchor, view), [anchor, view])
  const tasksByDay = useMemo(() => state.data.reduce((result, task) => {
    const key = dateKey(task.due_at)
    if (!result[key]) result[key] = []
    result[key].push(task)
    return result
  }, {}), [state.data])

  function move(direction) {
    setAnchor((current) => view === 'week'
      ? addDays(current, direction * 7)
      : new Date(current.getFullYear(), current.getMonth() + direction, 1))
  }

  const todayKey = dateKey(new Date())
  return (
    <>
      <PageHeader eyebrow="Agenda commerciale" title="Planning attività" description="Richiami e promemoria ancora da completare, organizzati per settimana o mese." />
      <Card className="planning-toolbar">
        <div className="planning-view-switch" aria-label="Vista planning">
          <Button type="button" variant={view === 'week' ? 'primary' : 'secondary'} aria-pressed={view === 'week'} onClick={() => setView('week')}>Settimana</Button>
          <Button type="button" variant={view === 'month' ? 'primary' : 'secondary'} aria-pressed={view === 'month'} onClick={() => setView('month')}>Mese</Button>
        </div>
        <div className="planning-navigation">
          <Button type="button" variant="secondary" aria-label="Periodo precedente" onClick={() => move(-1)}>←</Button>
          <Button type="button" variant="secondary" onClick={() => setAnchor(startOfDay(new Date()))}>Oggi</Button>
          <Button type="button" variant="secondary" aria-label="Periodo successivo" onClick={() => move(1)}>→</Button>
        </div>
        <h2>{periodTitle(anchor, view)}</h2>
        <Badge tone="blue">{state.data.length} attività aperte</Badge>
      </Card>

      {state.loading && <LoadingState label="Caricamento planning…" />}
      {!state.loading && state.error && <ErrorState message={state.error.message} onRetry={load} />}
      {!state.loading && !state.error && (
        <Card className={`planning-calendar planning-calendar-${view}`}>
          <div className="planning-weekdays">{DAY_NAMES.map((day) => <strong key={day}>{day}</strong>)}</div>
          <div className="planning-days">
            {days.map((day) => {
              const key = dateKey(day)
              const outsideMonth = view === 'month' && day.getMonth() !== anchor.getMonth()
              const tasks = tasksByDay[key] || []
              return (
                <section className={`planning-day ${outsideMonth ? 'planning-day-outside' : ''} ${key === todayKey ? 'planning-day-today' : ''}`} key={key} aria-label={new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(day)}>
                  <header><strong>{day.getDate()}</strong>{tasks.length > 0 && <span>{tasks.length}</span>}</header>
                  <div>{tasks.map((task) => <TaskItem key={task.id} task={task} />)}</div>
                </section>
              )
            })}
          </div>
        </Card>
      )}
    </>
  )
}
