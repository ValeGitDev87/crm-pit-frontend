const EXACT_MESSAGES = {
  'The given data was invalid.': 'I dati inseriti non sono validi.',
  'Too Many Attempts.': 'Troppe richieste. Attendi prima di riprovare.',
  'Page Expired': 'La sessione di sicurezza è scaduta. Riprova.',
  'CSRF token mismatch.': 'La sessione di sicurezza è scaduta. Riprova.',
  Unauthenticated: 'La sessione non è valida o è scaduta.',
  'Unauthenticated.': 'La sessione non è valida o è scaduta.',
  Unauthorized: 'Non hai i permessi per eseguire questa operazione.',
  'This action is unauthorized.': 'Non hai i permessi per eseguire questa operazione.',
  Forbidden: 'Non hai i permessi per eseguire questa operazione.',
  'Not Found': 'La risorsa richiesta non è stata trovata.',
  'Server Error': 'Il servizio non è disponibile. Riprova più tardi.',
}

const FIELD_LABELS = {
  active: 'stato attivo',
  body: 'testo',
  due_at: 'scadenza',
  email: 'email',
  file: 'file',
  is_closed: 'chiusura',
  lead: 'lead',
  name: 'nome',
  note: 'nota',
  password: 'password',
  password_confirmation: 'conferma password',
  role: 'ruolo',
  sort_order: 'ordine',
  status: 'stato',
  status_id: 'stato',
  system_key: 'chiave di sistema',
  title: 'titolo',
  type: 'tipo',
  user_id: 'operatore',
}

function fieldLabel(field) {
  return FIELD_LABELS[field] || field.replaceAll('_', ' ')
}

export function translateErrorMessage(message, { status, field } = {}) {
  if (!message) return ''
  if (EXACT_MESSAGES[message]) return EXACT_MESSAGES[message]

  const label = fieldLabel(field || 'campo')
  if (/^The .+ field is required\.?$/i.test(message)) return `Il campo ${label} è obbligatorio.`
  if (/^The selected .+ is invalid\.?$/i.test(message)) return `Il valore selezionato per ${label} non è valido.`
  if (/^The .+ has already been taken\.?$/i.test(message)) return `Il valore del campo ${label} è già utilizzato.`
  if (/^The .+ field must be a valid email address\.?$/i.test(message)) return 'Inserisci un indirizzo email valido.'
  if (/^The .+ field confirmation does not match\.?$/i.test(message)) return `La conferma del campo ${label} non coincide.`
  if (/^The .+ field must be (at least|no more than) /i.test(message)) return `Il valore del campo ${label} non rispetta la lunghezza richiesta.`
  if (/^The .+ field must be (a string|an integer|true or false|a valid date)\.?$/i.test(message)) return `Il formato del campo ${label} non è valido.`
  if (/^The .+ field format is invalid\.?$/i.test(message)) return `Il formato del campo ${label} non è valido.`
  if (/^The .+ field /i.test(message) || /^The selected /i.test(message)) return `Il valore del campo ${label} non è valido.`

  if (status === 401) return 'La sessione non è valida o è scaduta.'
  if (status === 403) return 'Non hai i permessi per eseguire questa operazione.'
  if (status === 404) return 'La risorsa richiesta non è stata trovata.'
  if (status === 419) return 'La sessione di sicurezza è scaduta. Riprova.'
  if (status === 429) return 'Troppe richieste. Attendi prima di riprovare.'
  if (status >= 500) return 'Il servizio non è disponibile. Riprova più tardi.'
  return message
}

export function translateFieldErrors(errors = {}) {
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [
    field,
    (Array.isArray(messages) ? messages : [messages]).filter(Boolean).map((message) => translateErrorMessage(message, { status: 422, field })),
  ]))
}
