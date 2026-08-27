import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const INITIAL_VALUES = { email: '', password: '' }

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError('')

    try {
      await login(values)
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors)
        const wait = error.status === 429 && error.retryAfter
          ? ` Riprova tra ${error.retryAfter} secondi.`
          : ''
        setFormError(`${error.message}${wait}`)
      } else {
        setFormError('Si è verificato un errore inatteso. Riprova.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand" aria-label="Prestito in Tasca CRM">
        <div className="brand-mark" aria-hidden="true">P</div>
        <div>
          <p className="eyebrow">Prestito in Tasca</p>
          <h1>Il lavoro commerciale, in un unico spazio.</h1>
          <p className="brand-copy">
            Accedi al CRM per gestire lead, pratiche e attività del team.
          </p>
        </div>
        <p className="brand-footer">Area riservata agli operatori autorizzati</p>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="mobile-brand">
            <span className="brand-mark brand-mark-small" aria-hidden="true">P</span>
            <strong>Prestito in Tasca CRM</strong>
          </div>
          <div className="form-heading">
            <p className="eyebrow">Bentornato</p>
            <h2>Accedi al CRM</h2>
            <p>Inserisci le credenziali del tuo account.</p>
          </div>

          {formError && <div className="alert alert-error" role="alert">{formError}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              autoComplete="email"
              autoFocus
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              disabled={submitting}
              required
            />
            {fieldErrors.email && (
              <small id="email-error" className="field-error">{fieldErrors.email[0]}</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              autoComplete="current-password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              disabled={submitting}
              required
            />
            {fieldErrors.password && (
              <small id="password-error" className="field-error">{fieldErrors.password[0]}</small>
            )}
          </div>

          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
      </section>
    </main>
  )
}
