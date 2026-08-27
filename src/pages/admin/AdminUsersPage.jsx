import { useCallback, useEffect, useState } from 'react'
import { createAdminUser, getAdminUsers, updateAdminUser } from '../../api/admin'
import { ApiError } from '../../api/client'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DataTable } from '../../components/common/DataTable'
import { PageHeader } from '../../components/common/PageHeader'
import { ErrorState } from '../../components/feedback/ErrorState'
import { LoadingState } from '../../components/feedback/LoadingState'
import { formatDateTime } from '../../utils/formatters'

const EMPTY_FORM = { name: '', email: '', role: 'operator', active: true, password: '', password_confirmation: '' }

function UserDialog({ user, open, onClose, onSaved }) {
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      setValues(user ? {
        name: user.name,
        email: user.email,
        role: user.role,
        active: Boolean(user.active),
        password: '',
        password_confirmation: '',
      } : EMPTY_FORM)
      setErrors({})
      setFormError('')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, user])

  if (!open) return null

  function change(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')

    const payload = { ...values }
    if (user && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    try {
      if (user) await updateAdminUser(user.id, payload)
      else await createAdminUser(payload)
      await onSaved(user ? 'Utente aggiornato correttamente.' : 'Utente creato correttamente.')
      onClose()
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors)
      setFormError(error.message || 'Salvataggio non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="user-dialog-title" onSubmit={submit} noValidate>
        <h2 id="user-dialog-title">{user ? 'Modifica utente' : 'Nuovo utente'}</h2>
        <p>{user ? 'Aggiorna account, ruolo e stato di accesso.' : 'Crea un nuovo account CRM.'}</p>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="admin-form-grid">
          <label><span>Nome</span><input name="name" value={values.name} onChange={change} required />{errors.name && <small className="field-error">{errors.name[0]}</small>}</label>
          <label><span>Email</span><input name="email" type="email" value={values.email} onChange={change} required />{errors.email && <small className="field-error">{errors.email[0]}</small>}</label>
          <label><span>Ruolo</span><select name="role" value={values.role} onChange={change}><option value="operator">Operator</option><option value="admin">Admin</option></select>{errors.role && <small className="field-error">{errors.role[0]}</small>}</label>
          <label className="checkbox-field"><input name="active" type="checkbox" checked={values.active} onChange={change} /><span>Account attivo</span></label>
          <label><span>{user ? 'Nuova password (opzionale)' : 'Password'}</span><input name="password" type="password" value={values.password} onChange={change} required={!user} autoComplete="new-password" />{errors.password && <small className="field-error">{errors.password[0]}</small>}</label>
          <label><span>Conferma password</span><input name="password_confirmation" type="password" value={values.password_confirmation} onChange={change} required={!user || Boolean(values.password)} autoComplete="new-password" /></label>
        </div>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Annulla</Button><Button type="submit" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva utente'}</Button></div>
      </form>
    </div>
  )
}

export function AdminUsersPage() {
  const [state, setState] = useState({ loading: true, data: [], error: null })
  const [dialog, setDialog] = useState({ open: false, user: null })
  const [notice, setNotice] = useState('')

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setState((current) => ({ ...current, loading: true, error: null }))
    try {
      setState({ loading: false, data: await getAdminUsers(), error: null })
    } catch (error) {
      setState({ loading: false, data: [], error })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function saved(message) {
    await load(false)
    setNotice(message)
  }

  const columns = [
    { key: 'name', label: 'Utente', render: (item) => <div className="table-primary"><strong>{item.name}</strong><span>{item.email}</span></div> },
    { key: 'role', label: 'Ruolo', render: (item) => <Badge tone={item.role === 'admin' ? 'blue' : 'neutral'}>{item.role}</Badge> },
    { key: 'active', label: 'Stato', render: (item) => <Badge tone={item.active ? 'success' : 'danger'}>{item.active ? 'Attivo' : 'Disattivato'}</Badge> },
    { key: 'created_at', label: 'Creato il', render: (item) => formatDateTime(item.created_at) },
    { key: 'actions', label: 'Azioni', render: (item) => <Button type="button" variant="secondary" onClick={() => setDialog({ open: true, user: item })}>Modifica</Button> },
  ]

  return (
    <>
      <PageHeader eyebrow="Amministrazione" title="Utenti" description="Gestisci account, ruoli e accesso al CRM." actions={<Button type="button" onClick={() => setDialog({ open: true, user: null })}>Nuovo utente</Button>} />
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {state.loading && <LoadingState label="Caricamento utenti…" />}
      {!state.loading && state.error && <ErrorState message={state.error.message} onRetry={load} />}
      {!state.loading && !state.error && <Card className="admin-table-card"><DataTable columns={columns} rows={state.data} emptyTitle="Nessun utente" /></Card>}
      <UserDialog user={dialog.user} open={dialog.open} onClose={() => setDialog({ open: false, user: null })} onSaved={saved} />
    </>
  )
}
