export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatInteger(value) {
  return new Intl.NumberFormat('it-IT').format(Number(value) || 0)
}

export function humanize(value) {
  if (!value) return 'Non disponibile'
  const labels = {
    initial: 'Iniziale',
    recycle: 'Ricircolo',
    automatic: 'Automatica',
    recycle_automatic: 'Automatica da ricircolo',
    manual: 'Manuale',
    scheduler: 'Pianificata',
    callback: 'Richiamo',
    follow_up: 'Promemoria',
    pending: 'In attesa',
    completed: 'Completata',
    cancelled: 'Annullata',
    open: 'Aperta',
    requested: 'Richiesto',
    uploaded: 'Caricato',
    verified: 'Verificato',
    rejected: 'Rifiutato',
    running: 'In corso',
    success: 'Completato',
    partial: 'Parziale',
    failed: 'Fallito',
    site: 'Sito',
    meta: 'Meta',
    practice: 'Pratica',
  }
  if (labels[value]) return labels[value]
  return String(value).replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value))
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}
