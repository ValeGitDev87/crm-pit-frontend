import { useCallback, useEffect, useState } from 'react'
import { getOrigins } from '../../api/admin'
import { ApiError } from '../../api/client'
import {
  createIntegrationMapping,
  getIntegrationMappings,
  getIntegrationRun,
  getIntegrationRuns,
  reprocessImport,
  startIntegrationSync,
  updateIntegrationMapping,
} from '../../api/integrations'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { DataTable } from '../../components/common/DataTable'
import { PageHeader } from '../../components/common/PageHeader'
import { Pagination } from '../../components/common/Pagination'
import { ErrorState } from '../../components/feedback/ErrorState'
import { LoadingState } from '../../components/feedback/LoadingState'
import { formatDateTime, formatInteger, humanize } from '../../utils/formatters'

const emptyMapping = { source_system: 'meta', external_key: '', external_label: '', lead_origin_id: '', active: true }

function runTone(status) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'running') return 'blue'
  return 'violet'
}

function MappingDialog({ item, required, origins, open, onClose, onSaved }) {
  const [values, setValues] = useState(emptyMapping)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const timer = setTimeout(() => {
      setValues(item ? {
        source_system: item.source_system,
        external_key: item.external_key,
        external_label: item.external_label || '',
        lead_origin_id: String(item.origin?.id || ''),
        active: item.active,
      } : required ? {
        source_system: required.source_system,
        external_key: required.external_key,
        external_label: required.external_label || '',
        lead_origin_id: '',
        active: true,
      } : emptyMapping)
      setErrors({})
    }, 0)
    return () => clearTimeout(timer)
  }, [item, open, required])

  if (!open) return null
  function change(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = { ...values, lead_origin_id: Number(values.lead_origin_id) }
      if (item) {
        await updateIntegrationMapping(item.id, { external_label: payload.external_label || null, lead_origin_id: payload.lead_origin_id, active: payload.active })
      } else {
        await createIntegrationMapping({ ...payload, external_label: payload.external_label || null })
        if (required?.latest_import_id) {
          try {
            await reprocessImport(required.latest_import_id)
          } catch (error) {
            await onSaved(`Mapping creato, ma la rielaborazione non è partita: ${error.message}`, 'error')
            onClose()
            return
          }
        }
      }
      await onSaved(required ? 'Mapping creato e ultimo import rimesso in elaborazione.' : 'Mapping salvato.', 'success')
      onClose()
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {}
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: [error.message] })
    } finally {
      setSaving(false)
    }
  }

  const lockedKey = Boolean(item || required)
  return (
    <div className="modal-backdrop">
      <form className="modal admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="mapping-title" onSubmit={submit}>
        <h2 id="mapping-title">{required ? 'Risolvi mapping richiesto' : item ? 'Modifica mapping' : 'Nuovo mapping'}</h2>
        {required && <p>Il mapping riattiverà l’ultimo import sospeso per questa campagna.</p>}
        {errors.form && <div className="alert alert-error" role="alert">{errors.form[0]}</div>}
        <div className="admin-form-grid">
          <label><span>Sistema</span><select name="source_system" value={values.source_system} disabled={lockedKey} onChange={change}><option value="site">Site</option><option value="meta">Meta</option></select></label>
          <label><span>Chiave esterna</span><input name="external_key" value={values.external_key} disabled={lockedKey} onChange={change} required />{errors.external_key && <small className="field-error">{errors.external_key[0]}</small>}</label>
          <label><span>Etichetta esterna</span><input name="external_label" value={values.external_label} onChange={change} />{errors.external_label && <small className="field-error">{errors.external_label[0]}</small>}</label>
          <label><span>Provenienza CRM</span><select name="lead_origin_id" value={values.lead_origin_id} onChange={change} required><option value="">Seleziona provenienza</option>{origins.map((origin) => <option key={origin.id} value={origin.id}>{origin.name}</option>)}</select>{errors.lead_origin_id && <small className="field-error">{errors.lead_origin_id[0]}</small>}</label>
          <label className="checkbox-field"><input name="active" type="checkbox" checked={values.active} onChange={change} /><span>Mapping attivo</span></label>
        </div>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Annulla</Button><Button type="submit" disabled={saving || !values.external_key || !values.lead_origin_id}>{saving ? 'Salvataggio…' : required ? 'Crea e rielabora' : 'Salva'}</Button></div>
      </form>
    </div>
  )
}

function RunDialog({ run, onClose }) {
  if (!run) return null
  return (
    <div className="modal-backdrop">
      <section className="modal integration-run-modal" role="dialog" aria-modal="true" aria-labelledby="run-title">
        <div className="modal-heading"><div><p className="eyebrow">Run #{run.id}</p><h2 id="run-title">Dettaglio sincronizzazione</h2></div><Badge tone={runTone(run.status)}>{humanize(run.status)}</Badge></div>
        <p>{run.run_uuid} · {humanize(run.trigger)} · {formatDateTime(run.started_at)}</p>
        <div className="integration-step-list">{run.steps?.length ? run.steps.map((step) => <article key={step.id}><div><strong>{humanize(step.source_system)}</strong><Badge tone={runTone(step.status)}>{humanize(step.status)}</Badge></div><dl><div><dt>Ricevuti</dt><dd>{formatInteger(step.received_count)}</dd></div><div><dt>Creati</dt><dd>{formatInteger(step.created_count)}</dd></div><div><dt>Riciclati</dt><dd>{formatInteger(step.recycled_count)}</dd></div><div><dt>Duplicati</dt><dd>{formatInteger(step.duplicate_count)}</dd></div><div><dt>Falliti</dt><dd>{formatInteger(step.failed_count)}</dd></div></dl>{step.error_message && <div className="alert alert-error">{step.error_message}</div>}</article>) : <p className="muted-copy">Il run è in coda: nessuno step disponibile.</p>}</div>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Chiudi</Button></div>
      </section>
    </div>
  )
}

export function AdminIntegrationsPage() {
  const [runs, setRuns] = useState({ loading: true, data: [], meta: {}, error: null, page: 1 })
  const [mappings, setMappings] = useState({ loading: true, data: [], meta: {}, error: null, page: 1 })
  const [origins, setOrigins] = useState([])
  const [syncing, setSyncing] = useState('')
  const [feedback, setFeedback] = useState({ message: '', type: 'success' })
  const [dialog, setDialog] = useState({ open: false, item: null, required: null })
  const [runDetail, setRunDetail] = useState(null)

  const loadRuns = useCallback(async (page = runs.page) => {
    setRuns((current) => ({ ...current, loading: true, page }))
    try { const result = await getIntegrationRuns(page); setRuns({ loading: false, ...result, error: null, page }) }
    catch (error) { setRuns((current) => ({ ...current, loading: false, error })) }
  }, [runs.page])
  const loadMappings = useCallback(async (page = mappings.page) => {
    setMappings((current) => ({ ...current, loading: true, page }))
    try { const result = await getIntegrationMappings(page); setMappings({ loading: false, ...result, error: null, page }) }
    catch (error) { setMappings((current) => ({ ...current, loading: false, error })) }
  }, [mappings.page])
  useEffect(() => { const timer = setTimeout(() => { loadRuns(1); loadMappings(1); getOrigins().then(setOrigins).catch((error) => setFeedback({ message: error.message, type: 'error' })) }, 0); return () => clearTimeout(timer) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function sync(source) {
    setSyncing(source); setFeedback({ message: '', type: 'success' })
    try { await startIntegrationSync(source); setFeedback({ message: `Sincronizzazione ${humanize(source)} accodata.`, type: 'success' }); await loadRuns(1) }
    catch (error) { setFeedback({ message: error.message, type: 'error' }) }
    finally { setSyncing('') }
  }
  async function showRun(id) {
    try { setRunDetail(await getIntegrationRun(id)) } catch (error) { setFeedback({ message: error.message, type: 'error' }) }
  }
  async function mappingSaved(message, type = 'success') { setFeedback({ message, type }); await loadMappings(1) }
  async function reprocess(item) {
    setFeedback({ message: '', type: 'success' })
    try { await reprocessImport(item.latest_import_id); setFeedback({ message: 'Import rimesso in elaborazione.', type: 'success' }); await loadMappings(1) }
    catch (error) { setFeedback({ message: error.message, type: 'error' }) }
  }

  const required = mappings.meta.mapping_required || []
  const latestRun = runs.data[0]
  const runColumns = [
    { key: 'id', label: 'Run', render: (item) => <div className="table-primary"><strong>#{item.id}</strong><span>{formatDateTime(item.started_at)}</span></div> },
    { key: 'trigger', label: 'Avvio', render: (item) => humanize(item.trigger) },
    { key: 'status', label: 'Stato', render: (item) => <Badge tone={runTone(item.status)}>{humanize(item.status)}</Badge> },
    { key: 'steps', label: 'Sorgenti', render: (item) => (item.steps || []).map((step) => humanize(step.source_system)).join(', ') || 'In coda' },
    { key: 'actions', label: 'Azioni', render: (item) => <Button variant="secondary" onClick={() => showRun(item.id)}>Dettaglio</Button> },
  ]
  const mappingColumns = [
    { key: 'external_key', label: 'Sorgente', render: (item) => <div className="table-primary"><strong>{item.external_label || item.external_key}</strong><span>{humanize(item.source_system)} · {item.external_key}</span></div> },
    { key: 'origin', label: 'Provenienza CRM', render: (item) => item.origin?.name || '—' },
    { key: 'active', label: 'Stato', render: (item) => <Badge tone={item.active ? 'success' : 'neutral'}>{item.active ? 'Attivo' : 'Disattivato'}</Badge> },
    { key: 'actions', label: 'Azioni', render: (item) => <Button variant="secondary" onClick={() => setDialog({ open: true, item, required: null })}>Modifica</Button> },
  ]

  return (
    <>
      <PageHeader eyebrow="Amministrazione" title="Integrazioni" description="Monitora Site e Meta, avvia sincronizzazioni e risolvi i mapping sospesi." actions={<Button onClick={() => setDialog({ open: true, item: null, required: null })}>Nuovo mapping</Button>} />
      {feedback.message && <div className={`alert alert-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</div>}
      <section className="integration-overview" aria-label="Stato generale integrazioni">
        <Card><p>Ultimo run</p><strong>{latestRun ? `#${latestRun.id}` : '—'}</strong><Badge tone={runTone(latestRun?.status)}>{latestRun ? humanize(latestRun.status) : 'Nessun dato'}</Badge></Card>
        <Card><p>Mapping richiesti</p><strong>{formatInteger(required.length)}</strong><span>campagne sospese</span></Card>
        <Card><div><div><p>Site</p><span>Importazione lead sito</span></div><Button aria-label="Sincronizza Site" disabled={Boolean(syncing)} onClick={() => sync('site')}>{syncing === 'site' ? 'Avvio…' : 'Sincronizza'}</Button></div></Card>
        <Card><div><div><p>Meta</p><span>Importazione campagne Meta</span></div><Button aria-label="Sincronizza Meta" disabled={Boolean(syncing)} onClick={() => sync('meta')}>{syncing === 'meta' ? 'Avvio…' : 'Sincronizza'}</Button></div></Card>
      </section>

      <section className="integration-section"><div className="section-title"><div><p className="eyebrow">Intervento richiesto</p><h2>Mapping sospesi</h2></div><Badge tone={required.length ? 'danger' : 'success'}>{required.length}</Badge></div><Card className="admin-table-card"><DataTable rowKey="latest_import_id" columns={[{ key: 'campaign', label: 'Campagna', render: (item) => <div className="table-primary"><strong>{item.external_label || item.external_key}</strong><span>{humanize(item.source_system)} · {item.external_key}</span></div> }, { key: 'count', label: 'Import sospesi', render: (item) => formatInteger(item.import_count) }, { key: 'actions', label: 'Azioni', render: (item) => <div className="inline-actions"><Button onClick={() => setDialog({ open: true, item: null, required: item })}>Configura e rielabora</Button><Button variant="secondary" onClick={() => reprocess(item)}>Rielabora</Button></div> }]} rows={required} emptyTitle="Nessun mapping richiesto" /></Card></section>

      <section className="integration-section"><div className="section-title"><div><p className="eyebrow">Cronologia</p><h2>Run di sincronizzazione</h2></div></div>{runs.loading ? <LoadingState /> : runs.error ? <ErrorState message={runs.error.message} onRetry={() => loadRuns(runs.page)} /> : <Card className="admin-table-card"><DataTable columns={runColumns} rows={runs.data} emptyTitle="Nessun run" /><Pagination meta={runs.meta} onPageChange={loadRuns} /></Card>}</section>

      <section className="integration-section"><div className="section-title"><div><p className="eyebrow">Configurazione</p><h2>Mapping attivi e storici</h2></div></div>{mappings.loading ? <LoadingState /> : mappings.error ? <ErrorState message={mappings.error.message} onRetry={() => loadMappings(mappings.page)} /> : <Card className="admin-table-card"><DataTable columns={mappingColumns} rows={mappings.data} emptyTitle="Nessun mapping" /><Pagination meta={mappings.meta} onPageChange={loadMappings} /></Card>}</section>

      <MappingDialog {...dialog} origins={origins} onClose={() => setDialog({ open: false, item: null, required: null })} onSaved={mappingSaved} />
      <RunDialog run={runDetail} onClose={() => setRunDetail(null)} />
    </>
  )
}
