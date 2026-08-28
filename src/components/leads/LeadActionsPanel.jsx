import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addLeadNote,
  changeLeadStatus,
  createLeadTask,
  getWorkflowStatuses,
  updateLeadTask,
} from '../../api/leads'
import { ApiError } from '../../api/client'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { humanize } from '../../utils/formatters'
import { createPractice } from '../../api/practices'

function errorFor(error, field) {
  if (error instanceof ApiError && error.fieldErrors[field]?.[0]) return error.fieldErrors[field][0]
  return error.message || 'Operazione non riuscita.'
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null
}

function TaskQuickActions({ task, onChanged, onNotice }) {
  const [dueAt, setDueAt] = useState(toLocalInput(task.due_at))
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function update(changes, action) {
    setBusy(action)
    setError('')
    try {
      await updateLeadTask(task.id, changes)
      await onChanged()
      onNotice('Attività aggiornata correttamente.')
    } catch (requestError) {
      setError(errorFor(requestError, 'status'))
    } finally {
      setBusy('')
    }
  }

  return (
    <article className="managed-task">
      <div><strong>{task.title}</strong><Badge tone={task.status === 'pending' ? 'blue' : 'neutral'}>{humanize(task.status)}</Badge></div>
      <p>{task.note || humanize(task.type)}</p>
      {task.status === 'pending' && (
        <>
          <label><span>Scadenza</span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
          <div className="task-actions">
            <Button type="button" variant="secondary" disabled={Boolean(busy) || !dueAt} onClick={() => update({ due_at: toIso(dueAt) }, 'date')}>{busy === 'date' ? 'Attendi…' : 'Modifica data'}</Button>
            <Button type="button" variant="secondary" disabled={Boolean(busy)} onClick={() => update({ status: 'cancelled' }, 'cancel')}>{busy === 'cancel' ? 'Attendi…' : 'Annulla'}</Button>
            <Button type="button" disabled={Boolean(busy)} onClick={() => update({ status: 'completed' }, 'complete')}>{busy === 'complete' ? 'Attendi…' : 'Completa'}</Button>
          </div>
        </>
      )}
      {error && <small className="field-error" role="alert">{error}</small>}
    </article>
  )
}

export function LeadActionsPanel({ lead, onChanged, user }) {
  const currentCycle = lead.cycles?.find((cycle) => cycle.cycle_number === lead.current_cycle_number)
  const assignedOperator = lead.current_assigned_user
  const taskDescription = user?.role === 'admin'
    ? `Programma attività per ${assignedOperator?.name || 'l’operatore assegnato'}`
    : 'Programma una nuova attività'
  const [statuses, setStatuses] = useState([])
  const [statusId, setStatusId] = useState(String(lead.current_status?.id || ''))
  const [statusesError, setStatusesError] = useState('')
  const [notice, setNotice] = useState('')
  const [statusState, setStatusState] = useState({ busy: false, error: '' })
  const [note, setNote] = useState('')
  const [noteState, setNoteState] = useState({ busy: false, error: '' })
  const [task, setTask] = useState({ type: 'callback', title: '', note: '', due_at: '' })
  const [taskState, setTaskState] = useState({ busy: false, error: '' })
  const [practiceBusy, setPracticeBusy] = useState(false)
  const [practiceError, setPracticeError] = useState('')

  useEffect(() => {
    let active = true
    getWorkflowStatuses()
      .then((items) => active && setStatuses(items))
      .catch((error) => active && setStatusesError(error.message))
    return () => { active = false }
  }, [])

  async function submitStatus(event) {
    event.preventDefault()
    setStatusState({ busy: true, error: '' })
    setNotice('')
    try {
      await changeLeadStatus(lead.id, statusId)
      await onChanged()
      setNotice('Stato aggiornato correttamente.')
      setStatusState({ busy: false, error: '' })
    } catch (error) {
      setStatusState({ busy: false, error: errorFor(error, 'status_id') })
    }
  }

  async function submitNote(event) {
    event.preventDefault()
    setNoteState({ busy: true, error: '' })
    setNotice('')
    try {
      await addLeadNote(lead.id, note)
      await onChanged()
      setNote('')
      setNotice('Nota aggiunta correttamente.')
      setNoteState({ busy: false, error: '' })
    } catch (error) {
      setNoteState({ busy: false, error: errorFor(error, 'body') })
    }
  }

  async function submitTask(event) {
    event.preventDefault()
    setTaskState({ busy: true, error: '' })
    setNotice('')
    try {
      await createLeadTask(lead.id, { ...task, due_at: toIso(task.due_at) })
      await onChanged()
      setTask({ type: 'callback', title: '', note: '', due_at: '' })
      setNotice('Attività creata correttamente.')
      setTaskState({ busy: false, error: '' })
    } catch (error) {
      setTaskState({ busy: false, error: errorFor(error, 'title') })
    }
  }

  async function openPractice() {
    setPracticeBusy(true)
    setPracticeError('')
    try { await createPractice(lead.id); await onChanged(); setNotice('Pratica creata correttamente.') }
    catch (error) { setPracticeError(error.message) }
    finally { setPracticeBusy(false) }
  }

  return (
    <section className="manage-section" aria-labelledby="manage-title">
      <div className="section-title"><div><p className="eyebrow">Azioni operative</p><h2 id="manage-title">Gestisci lead</h2></div>{currentCycle?.practice ? <Link className="button button-secondary link-button" to={`/practices/${currentCycle.practice.id}`}>Apri pratica</Link> : <Button type="button" variant="secondary" onClick={openPractice} disabled={practiceBusy}>{practiceBusy ? 'Creazione…' : 'Crea pratica'}</Button>}</div>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {practiceError && <div className="alert alert-error" role="alert">{practiceError}</div>}
      <div className="manage-grid">
        <Card className="action-card">
          <h3>Cambia stato</h3><p>Seleziona uno stato attivo della pipeline.</p>
          {statusesError && <div className="alert alert-error" role="alert">{statusesError}</div>}
          <form onSubmit={submitStatus}>
            <label><span>Stato</span><select value={statusId} onChange={(event) => setStatusId(event.target.value)} disabled={statusState.busy || !statuses.length}>{statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</select></label>
            {statusState.error && <small className="field-error" role="alert">{statusState.error}</small>}
            <Button type="submit" disabled={statusState.busy || !statusId}>{statusState.busy ? 'Aggiornamento…' : 'Aggiorna stato'}</Button>
          </form>
        </Card>

        <Card className="action-card">
          <h3>Aggiungi nota</h3><p>La nota sarà associata al ciclo corrente.</p>
          <form onSubmit={submitNote}>
            <label><span>Nota commerciale</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows="4" required /></label>
            {noteState.error && <small className="field-error" role="alert">{noteState.error}</small>}
            <Button type="submit" disabled={noteState.busy || !note.trim()}>{noteState.busy ? 'Salvataggio…' : 'Aggiungi nota'}</Button>
          </form>
        </Card>

        <Card className="action-card action-card-wide">
          <h3>Programma attività</h3>
          {assignedOperator ? (
            <>
              <p>{taskDescription}</p>
              <form className="task-form" onSubmit={submitTask}>
                <label><span>Tipo</span><select value={task.type} onChange={(event) => setTask((current) => ({ ...current, type: event.target.value }))}><option value="callback">Richiamo</option><option value="follow_up">Promemoria</option></select></label>
                <label><span>Titolo</span><input value={task.title} onChange={(event) => setTask((current) => ({ ...current, title: event.target.value }))} required /></label>
                <label><span>Scadenza</span><input type="datetime-local" value={task.due_at} onChange={(event) => setTask((current) => ({ ...current, due_at: event.target.value }))} required /></label>
                <label className="task-note-field"><span>Nota</span><input value={task.note} onChange={(event) => setTask((current) => ({ ...current, note: event.target.value }))} /></label>
                {taskState.error && <small className="field-error" role="alert">{taskState.error}</small>}
                <Button type="submit" disabled={taskState.busy || !task.title.trim() || !task.due_at}>{taskState.busy ? 'Creazione…' : 'Crea attività'}</Button>
              </form>
            </>
          ) : <div className="alert alert-warning" role="status">Assegna prima un operatore al lead per programmare un’attività.</div>}
        </Card>
      </div>

      <Card className="managed-tasks-card">
        <div className="detail-card-heading"><h2>Attività del ciclo corrente</h2></div>
        <div className="managed-task-list">
          {currentCycle?.tasks?.length ? currentCycle.tasks.map((item) => <TaskQuickActions key={item.id} task={item} onChanged={onChanged} onNotice={setNotice} />) : <p className="muted-copy">Nessuna attività nel ciclo corrente.</p>}
        </div>
      </Card>
    </section>
  )
}
