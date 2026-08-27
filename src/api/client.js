const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let csrfReady = false
let csrfRequest = null
let unauthorizedHandler = null

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 0
    this.fieldErrors = options.fieldErrors ?? {}
    this.retryAfter = options.retryAfter ?? null
    this.payload = options.payload ?? null
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

function readCookie(name) {
  if (typeof document === 'undefined') return null

  const prefix = `${name}=`
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

async function readPayload(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()

  const text = await response.text()
  return text ? { message: text } : null
}

function errorMessage(status, payload) {
  if (payload?.message) return payload.message
  if (status === 401) return 'La sessione non è valida o è scaduta.'
  if (status === 403) return 'Non hai i permessi per eseguire questa operazione.'
  if (status === 419) return 'La sessione di sicurezza è scaduta. Riprova.'
  if (status === 422) return 'Controlla i dati inseriti.'
  if (status === 429) return 'Troppe richieste. Attendi prima di riprovare.'
  if (status >= 500) return 'Il servizio non è disponibile. Riprova più tardi.'
  return 'La richiesta non è andata a buon fine.'
}

function buildApiError(response, payload) {
  const retryAfterHeader = response.headers.get('retry-after')
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : null

  return new ApiError(errorMessage(response.status, payload), {
    status: response.status,
    fieldErrors: response.status === 422 ? payload?.errors || {} : {},
    retryAfter: Number.isNaN(retryAfter) ? null : retryAfter,
    payload,
  })
}

export async function ensureCsrfCookie({ force = false } = {}) {
  if (force) csrfReady = false
  if (csrfReady) return
  if (csrfRequest) return csrfRequest

  csrfRequest = fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
    .then((response) => {
      if (!response.ok && response.status !== 204) {
        throw buildApiError(response, null)
      }
      csrfReady = true
    })
    .catch((error) => {
      if (error instanceof ApiError) throw error
      throw new ApiError('Impossibile contattare il server.', { payload: error })
    })
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}

async function performRequest(path, options, hasRetriedAfter419 = false) {
  const fetchOptions = { ...options }
  const rawBody = fetchOptions.body
  const responseType = fetchOptions.responseType
  delete fetchOptions.body
  delete fetchOptions.responseType
  delete fetchOptions.csrf
  const method = (fetchOptions.method || 'GET').toUpperCase()
  const headers = new Headers(fetchOptions.headers || {})
  headers.set('Accept', responseType === 'blob' ? '*/*' : 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')

  let body = rawBody
  const isBinaryBody = rawBody instanceof FormData || rawBody instanceof Blob

  if (rawBody != null && !isBinaryBody && typeof rawBody !== 'string') {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(rawBody)
  }

  if (MUTATION_METHODS.has(method)) {
    const xsrfToken = readCookie('XSRF-TOKEN')
    if (xsrfToken) headers.set('X-XSRF-TOKEN', xsrfToken)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      method,
      headers,
      body,
      credentials: 'include',
    })
  } catch (error) {
    throw new ApiError('Impossibile contattare il server.', { payload: error })
  }

  if (response.status === 419 && !hasRetriedAfter419) {
    await ensureCsrfCookie({ force: true })
    return performRequest(path, options, true)
  }

  if (response.status === 401 && unauthorizedHandler) unauthorizedHandler()

  if (!response.ok) {
    throw buildApiError(response, await readPayload(response))
  }

  if (responseType === 'blob') return response.blob()
  return readPayload(response)
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  if (options.csrf || MUTATION_METHODS.has(method)) await ensureCsrfCookie()
  return performRequest(path, options)
}

export function resetApiClientState() {
  csrfReady = false
  csrfRequest = null
  unauthorizedHandler = null
}
