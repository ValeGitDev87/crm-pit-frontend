import { useCallback, useEffect, useState } from 'react'
import { createLeadStatus, deleteLeadStatus, getLeadStatuses, updateLeadStatus } from '../../api/admin'
import { ApiError } from '../../api/client'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DataTable } from '../../components/common/DataTable'
import { PageHeader } from '../../components/common/PageHeader'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { ErrorState } from '../../components/feedback/ErrorState'
import { LoadingState } from '../../components/feedback/LoadingState'

const EMPTY = { name: '', system_key: '', sort_order: 0, active: true, is_closed: false }

function StatusDialog({ item, open, onClose, onSaved }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const timer = setTimeout(() => { setValues(item ? { name: item.name, system_key: item.system_key || '', sort_order: item.sort_order, active: item.active, is_closed: item.is_closed } : EMPTY); setErrors({}) }, 0)
    return () => clearTimeout(timer)
  }, [item, open])

  if (!open) return null
  function change(event) { const { name, value, checked, type } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })) }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setErrors({})
    const payload = { ...values, sort_order: Number(values.sort_order), system_key: values.system_key || null }
    try { if (item) await updateLeadStatus(item.id, payload); else await createLeadStatus(payload); await onSaved(); onClose() }
    catch (error) { if (error instanceof ApiError) setErrors(error.fieldErrors) }
    finally { setSaving(false) }
  }
  return <div className="modal-backdrop"><form className="modal admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="status-title" onSubmit={submit}><h2 id="status-title">{item ? 'Modifica stato' : 'Nuovo stato'}</h2><div className="admin-form-grid"><label><span>Nome</span><input name="name" value={values.name} onChange={change} required />{errors.name && <small className="field-error">{errors.name[0]}</small>}</label><label><span>System key</span><input name="system_key" value={values.system_key} onChange={change} disabled={Boolean(item?.system_key)} />{errors.system_key && <small className="field-error">{errors.system_key[0]}</small>}</label><label><span>Ordine</span><input name="sort_order" type="number" value={values.sort_order} onChange={change} /></label><label className="checkbox-field"><input name="active" type="checkbox" checked={values.active} onChange={change} disabled={item?.protected} /><span>Attivo</span></label><label className="checkbox-field"><input name="is_closed" type="checkbox" checked={values.is_closed} onChange={change} disabled={item?.protected} /><span>Chiude il ciclo</span></label></div><div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Annulla</Button><Button type="submit" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva'}</Button></div></form></div>
}

export function AdminStatusesPage() {
  const [state, setState] = useState({ loading: true, data: [], error: null }); const [dialog, setDialog] = useState({ open: false, item: null }); const [deleting, setDeleting] = useState(null); const [deleteBusy, setDeleteBusy] = useState(false); const [feedback, setFeedback] = useState({ message: '', type: 'success' })
  const load = useCallback(async () => { try { setState({ loading: false, data: await getLeadStatuses(), error: null }) } catch (error) { setState({ loading: false, data: [], error }) } }, [])
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer) }, [load])
  async function saved() { await load(); setFeedback({ message: 'Configurazione stato salvata.', type: 'success' }) }
  async function remove() { setDeleteBusy(true); try { await deleteLeadStatus(deleting.id); setDeleting(null); await load(); setFeedback({ message: 'Stato eliminato.', type: 'success' }) } catch (error) { setDeleting(null); setFeedback({ message: error.message, type: 'error' }) } finally { setDeleteBusy(false) } }
  const columns = [{ key: 'name', label: 'Stato', render: (i) => <><strong>{i.name}</strong>{i.protected && <Badge tone="blue">Protetto</Badge>}</> }, { key: 'system_key', label: 'System key', render: (i) => i.system_key || '—' }, { key: 'sort_order', label: 'Ordine' }, { key: 'active', label: 'Attivo', render: (i) => <Badge tone={i.active ? 'success' : 'danger'}>{i.active ? 'Sì' : 'No'}</Badge> }, { key: 'is_closed', label: 'Chiusura', render: (i) => i.is_closed ? 'Chiude ciclo' : 'Aperto' }, { key: 'actions', label: 'Azioni', render: (i) => <div className="inline-actions"><Button variant="secondary" onClick={() => setDialog({ open: true, item: i })}>Modifica</Button>{!i.protected && <Button variant="danger" onClick={() => setDeleting(i)}>Elimina</Button>}</div> }]
  return <><PageHeader eyebrow="Pipeline" title="Stati lead" description="Configura ordine e comportamento degli stati commerciali." actions={<Button onClick={() => setDialog({ open: true, item: null })}>Nuovo stato</Button>} />{feedback.message && <div className={`alert alert-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</div>}{state.loading ? <LoadingState /> : state.error ? <ErrorState message={state.error.message} onRetry={load} /> : <Card className="admin-table-card"><DataTable columns={columns} rows={state.data} emptyTitle="Nessuno stato" /></Card>}<StatusDialog {...dialog} onClose={() => setDialog({ open: false, item: null })} onSaved={saved} /><ConfirmDialog open={Boolean(deleting)} busy={deleteBusy} title="Elimina stato" message="Lo stato può essere eliminato solo se non è mai stato utilizzato." confirmLabel="Elimina" onClose={() => setDeleting(null)} onConfirm={remove} /></>
}
