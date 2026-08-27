import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError } from './api/client'
import { AuthProvider } from './context/AuthProvider'

vi.mock('./api/auth', () => ({
  currentUserRequest: vi.fn(),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
}))

vi.mock('./api/dashboard', () => ({ getDashboard: vi.fn() }))
vi.mock('./api/leads', () => ({ getLeads: vi.fn(), getLead: vi.fn() }))
vi.mock('./api/admin', () => ({
  getAdminUsers: vi.fn(),
  getLeadStatuses: vi.fn(),
  getOrigins: vi.fn(),
  getOrigin: vi.fn(),
  assignLead: vi.fn(),
}))

import { currentUserRequest, loginRequest } from './api/auth'
import { getDashboard } from './api/dashboard'
import { getLead, getLeads } from './api/leads'
import { assignLead, getAdminUsers, getLeadStatuses, getOrigin, getOrigins } from './api/admin'

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider><App /></AuthProvider>
    </MemoryRouter>,
  )
}

describe('autenticazione applicazione', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDashboard.mockResolvedValue({
      role: 'admin',
      global: {},
      by_origin: [],
      by_operator: [],
      sync_status: [],
    })
    getLeads.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } })
    getAdminUsers.mockResolvedValue([])
    getLeadStatuses.mockResolvedValue([])
    getOrigins.mockResolvedValue([])
    getOrigin.mockResolvedValue({ operators: [] })
    assignLead.mockResolvedValue({})
  })

  it('ripristina una sessione valida con /auth/me e mostra la dashboard', async () => {
    currentUserRequest.mockResolvedValue({
      id: 1,
      name: 'Mario Rossi',
      email: 'mario@example.test',
      role: 'admin',
      active: true,
    })

    renderApp('/dashboard')

    expect(screen.getByText('Verifica della sessione…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Ciao, Mario Rossi' })).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('porta l’utente anonimo al login e completa l’accesso', async () => {
    currentUserRequest.mockRejectedValue(new ApiError('Non autenticato', { status: 401 }))
    loginRequest.mockResolvedValue({
      id: 2,
      name: 'Anna Bianchi',
      email: 'anna@example.test',
      role: 'operator',
      active: true,
    })
    const user = userEvent.setup()

    renderApp('/dashboard')
    await screen.findByRole('heading', { name: 'Accedi al CRM' })
    await user.type(screen.getByLabelText('Email'), 'anna@example.test')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    await waitFor(() => expect(loginRequest).toHaveBeenCalledWith({
      email: 'anna@example.test',
      password: 'secret',
    }))
    expect(await screen.findByRole('heading', { name: 'Ciao, Anna Bianchi' })).toBeInTheDocument()
  })

  it('mostra vicino al campo gli errori di validazione del login', async () => {
    currentUserRequest.mockRejectedValue(new ApiError('Non autenticato', { status: 401 }))
    loginRequest.mockRejectedValue(new ApiError('The given data was invalid.', {
      status: 422,
      fieldErrors: { email: ['Credenziali non valide.'] },
    }))
    const user = userEvent.setup()

    renderApp('/login')
    await user.type(await screen.findByLabelText('Email'), 'bad@example.test')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Accedi' }))

    expect(await screen.findByText('Credenziali non valide.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('mostra all’operator solo la navigazione condivisa e blocca le route admin', async () => {
    currentUserRequest.mockResolvedValue({
      id: 2,
      name: 'Anna Bianchi',
      email: 'anna@example.test',
      role: 'operator',
      active: true,
    })

    renderApp('/admin/users')

    expect(await screen.findByRole('heading', { name: 'Accesso non autorizzato' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /I miei lead/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Utenti/ })).not.toBeInTheDocument()
  })

  it('mostra all’admin tutte le sezioni e gestisce le pagine inesistenti', async () => {
    currentUserRequest.mockResolvedValue({
      id: 1,
      name: 'Mario Rossi',
      email: 'mario@example.test',
      role: 'admin',
      active: true,
    })

    renderApp('/pagina-inesistente')

    expect(await screen.findByRole('heading', { name: 'Pagina non trovata' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ricircoli/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Integrazioni/ })).toBeInTheDocument()
  })

  it('renderizza la dashboard Operator con conteggi e liste operative', async () => {
    currentUserRequest.mockResolvedValue({
      id: 2,
      name: 'Anna Bianchi',
      email: 'anna@example.test',
      role: 'operator',
      active: true,
    })
    getDashboard.mockResolvedValue({
      role: 'operator',
      counts: { assigned_leads: 4, new_leads: 1, callbacks_today: 1, overdue_tasks: 0, in_progress: 2, open_practices: 0 },
      new_leads: [{ id: 10, contact_name: 'Luca Verdi', origin: 'Sito', last_received_at: '2026-08-27T10:00:00+02:00' }],
      callbacks_today: [],
      overdue_tasks: [],
      open_practices: [],
    })

    renderApp('/dashboard')

    expect(await screen.findByText('Lead assegnati')).toBeInTheDocument()
    expect(screen.getByText('Luca Verdi')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Luca Verdi/ })).toHaveAttribute('href', '/leads/10')
  })

  it('renderizza aggregati e stato sync nella dashboard Admin', async () => {
    currentUserRequest.mockResolvedValue({
      id: 1,
      name: 'Mario Rossi',
      email: 'mario@example.test',
      role: 'admin',
      active: true,
    })
    getDashboard.mockResolvedValue({
      role: 'admin',
      global: { leads: 12, open_leads: 8, closed_leads: 4, recycled_leads: 2, unassigned_leads: 1, open_practices: 3 },
      by_origin: [{ origin: { id: 1, name: 'Sito' }, leads: 7, recycled: 1, unassigned: 0 }],
      by_operator: [{ operator: { id: 2, name: 'Anna Bianchi' }, leads: 5, new: 2, recycled: 1 }],
      sync_status: [{ source_system: 'site', status: 'success', finished_at: '2026-08-27T10:00:00+02:00' }],
    })

    renderApp('/dashboard')

    expect(await screen.findByText('Lead globali')).toBeInTheDocument()
    expect(screen.getByText('Sincronizzazione Site')).toBeInTheDocument()
    expect(screen.getByText('Anna Bianchi', { selector: 'strong' })).toBeInTheDocument()
  })

  it('mostra filtri e paginazione backend nella lista lead Admin', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario Rossi', email: 'mario@example.test', role: 'admin', active: true })
    getAdminUsers.mockResolvedValue([{ id: 2, name: 'Anna', role: 'operator', active: true }])
    getOrigins.mockResolvedValue([{ id: 3, name: 'Sito', active: true }])
    getLeadStatuses.mockResolvedValue([{ id: 4, name: 'Nuovo', system_key: 'new', active: true }])
    getLeads.mockResolvedValue({
      data: [{
        id: 10,
        contact: { first_name: 'Luca', last_name: 'Verdi', email: 'luca@example.test' },
        origin: { name: 'Sito' },
        current_status: { name: 'Nuovo', system_key: 'new' },
        current_assigned_user: null,
        current_cycle_number: 2,
        recycle_count: 1,
        last_received_at: '2026-08-27T10:00:00+02:00',
      }],
      meta: { current_page: 1, last_page: 2, total: 21 },
    })
    const user = userEvent.setup()

    renderApp('/leads')

    expect(await screen.findByRole('heading', { name: 'Lead' })).toBeInTheDocument()
    expect(await screen.findByText('Luca Verdi')).toBeInTheDocument()
    expect(screen.getByText('Rientrato x1')).toBeInTheDocument()
    expect(screen.getByText('Non assegnato')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Successiva' }))
    await waitFor(() => expect(getLeads).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })))
  })

  it('non carica i filtri Admin nella lista lead Operator', async () => {
    currentUserRequest.mockResolvedValue({ id: 2, name: 'Anna', email: 'anna@example.test', role: 'operator', active: true })

    renderApp('/leads')

    expect(await screen.findByRole('heading', { name: 'I miei lead' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Operatore')).not.toBeInTheDocument()
    expect(getAdminUsers).not.toHaveBeenCalled()
  })

  it('mostra dettaglio, cicli e riassegnazione Admin con operatori eleggibili', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario Rossi', email: 'mario@example.test', role: 'admin', active: true })
    getLead.mockResolvedValue({
      id: 10,
      contact: { first_name: 'Luca', last_name: 'Verdi', email: 'luca@example.test', phone: '3331234567', birth_date: '1985-02-10', profession: 'Impiegato', residence: 'Roma' },
      origin: { id: 3, name: 'Sito' },
      current_status: { id: 4, name: 'Nuovo', system_key: 'new', is_closed: false },
      current_assigned_user: { id: 2, name: 'Anna' },
      current_cycle_number: 2,
      recycle_count: 1,
      first_received_at: '2026-07-20T10:00:00+02:00',
      last_received_at: '2026-08-27T10:00:00+02:00',
      cycles: [{
        id: 20, cycle_number: 2, trigger: 'recycle', desired_amount: '15000', profession: 'Impiegato', residence: 'Roma', source_system: 'site', raw_origin: 'landing', started_at: '2026-08-27T10:00:00+02:00', ended_at: null, final_status: null,
        assignments: [{ id: 1, user: { name: 'Anna' }, assignment_type: 'recycle_automatic', started_at: '2026-08-27T10:00:00+02:00' }],
        status_history: [{ id: 1, status: { name: 'Nuovo' }, changed_by: null, changed_at: '2026-08-27T10:00:00+02:00' }],
        notes: [{ id: 1, author: { name: 'Anna' }, body: 'Primo contatto', created_at: '2026-08-27T11:00:00+02:00' }],
        tasks: [{ id: 1, title: 'Richiamare', type: 'callback', status: 'pending', due_at: '2026-08-28T10:00:00+02:00' }],
        practice: null,
      }],
    })
    getOrigin.mockResolvedValue({ operators: [{ id: 2, name: 'Anna', active: true, receives_leads: true }] })
    const user = userEvent.setup()

    renderApp('/leads/10')

    expect(await screen.findByRole('heading', { name: 'Luca Verdi' })).toBeInTheDocument()
    expect(screen.getByText('Ciclo #2')).toBeInTheDocument()
    expect(screen.getByText('Primo contatto')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Riassegna' }))
    const dialog = await screen.findByRole('dialog', { name: 'Riassegna lead' })
    expect(within(dialog).getByRole('option', { name: 'Anna' })).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Riassegna' }))

    await waitFor(() => expect(assignLead).toHaveBeenCalledWith(10, '2'))
    expect(await screen.findByText('Lead riassegnato correttamente.')).toBeInTheDocument()
  })
})
