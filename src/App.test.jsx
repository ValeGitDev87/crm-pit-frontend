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
vi.mock('./api/leads', () => ({
  getLeads: vi.fn(),
  getLead: vi.fn(),
  getWorkflowStatuses: vi.fn(),
  changeLeadStatus: vi.fn(),
  addLeadNote: vi.fn(),
  createLeadTask: vi.fn(),
  updateLeadTask: vi.fn(),
}))
vi.mock('./api/admin', () => ({
  getAdminUsers: vi.fn(),
  getLeadStatuses: vi.fn(),
  getOrigins: vi.fn(),
  getOrigin: vi.fn(),
  assignLead: vi.fn(),
  createAdminUser: vi.fn(),
  updateAdminUser: vi.fn(),
  createLeadStatus: vi.fn(),
  updateLeadStatus: vi.fn(),
  deleteLeadStatus: vi.fn(),
  createOrigin: vi.fn(),
  updateOrigin: vi.fn(),
  deleteOrigin: vi.fn(),
  updateOriginOperators: vi.fn(),
  getRecycles: vi.fn(),
  assignRecycle: vi.fn(),
}))
vi.mock('./api/practices', () => ({
  getPractice: vi.fn(),
  createPractice: vi.fn(),
  requestDocument: vi.fn(),
  uploadDocument: vi.fn(),
  updateDocument: vi.fn(),
  downloadDocument: vi.fn(),
  addPracticeNote: vi.fn(),
}))
vi.mock('./api/integrations', () => ({
  getIntegrationRuns: vi.fn(),
  getIntegrationRun: vi.fn(),
  startIntegrationSync: vi.fn(),
  getIntegrationMappings: vi.fn(),
  createIntegrationMapping: vi.fn(),
  updateIntegrationMapping: vi.fn(),
  reprocessImport: vi.fn(),
}))

import { currentUserRequest, loginRequest } from './api/auth'
import { getDashboard } from './api/dashboard'
import {
  addLeadNote,
  changeLeadStatus,
  createLeadTask,
  getLead,
  getLeads,
  getWorkflowStatuses,
  updateLeadTask,
} from './api/leads'
import {
  assignLead,
  createAdminUser,
  createLeadStatus,
  createOrigin,
  deleteLeadStatus,
  deleteOrigin,
  getAdminUsers,
  getLeadStatuses,
  getOrigin,
  getOrigins,
  getRecycles,
  updateAdminUser,
  updateLeadStatus,
  updateOrigin,
  updateOriginOperators,
  assignRecycle,
} from './api/admin'
import {
  addPracticeNote,
  createPractice,
  downloadDocument,
  getPractice,
  requestDocument,
  updateDocument,
  uploadDocument,
} from './api/practices'
import {
  createIntegrationMapping,
  getIntegrationMappings,
  getIntegrationRun,
  getIntegrationRuns,
  reprocessImport,
  startIntegrationSync,
  updateIntegrationMapping,
} from './api/integrations'

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
    getWorkflowStatuses.mockResolvedValue([])
    changeLeadStatus.mockResolvedValue({})
    addLeadNote.mockResolvedValue({})
    createLeadTask.mockResolvedValue({})
    updateLeadTask.mockResolvedValue({})
    getAdminUsers.mockResolvedValue([])
    getLeadStatuses.mockResolvedValue([])
    getOrigins.mockResolvedValue([])
    getOrigin.mockResolvedValue({ operators: [] })
    assignLead.mockResolvedValue({})
    createAdminUser.mockResolvedValue({})
    updateAdminUser.mockResolvedValue({})
    createLeadStatus.mockResolvedValue({})
    updateLeadStatus.mockResolvedValue({})
    deleteLeadStatus.mockResolvedValue({})
    createOrigin.mockResolvedValue({})
    updateOrigin.mockResolvedValue({})
    deleteOrigin.mockResolvedValue({})
    updateOriginOperators.mockResolvedValue({})
    getRecycles.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } })
    assignRecycle.mockResolvedValue({})
    getPractice.mockResolvedValue({ id: 30, status: 'open', opened_at: '2026-08-27T10:00:00+02:00', documents: [], notes: [] })
    createPractice.mockResolvedValue({})
    requestDocument.mockResolvedValue({})
    uploadDocument.mockResolvedValue({})
    updateDocument.mockResolvedValue({})
    downloadDocument.mockResolvedValue(new Blob(['documento'], { type: 'application/pdf' }))
    addPracticeNote.mockResolvedValue({})
    getIntegrationRuns.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } })
    getIntegrationRun.mockResolvedValue({})
    startIntegrationSync.mockResolvedValue({})
    getIntegrationMappings.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1, total: 0, mapping_required: [] } })
    createIntegrationMapping.mockResolvedValue({})
    updateIntegrationMapping.mockResolvedValue({})
    reprocessImport.mockResolvedValue({})
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
    expect(screen.getByText('Prestito in Tasca', { selector: '.sidebar-brand strong' })).toBeInTheDocument()
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
    expect(screen.getByLabelText('Prestito in Tasca CRM')).toBeInTheDocument()
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
    expect(screen.getByText('Sincronizzazione Sito')).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Gestisci' })).toHaveAttribute('href', '/leads/10')
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
    expect(screen.getByText('Programma attività per Anna')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Promemoria' })).toHaveValue('follow_up')
    expect(screen.queryByText(/follow-up/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Riassegna' }))
    const dialog = await screen.findByRole('dialog', { name: 'Riassegna lead' })
    expect(within(dialog).getByRole('option', { name: 'Anna' })).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Riassegna' }))

    await waitFor(() => expect(assignLead).toHaveBeenCalledWith(10, '2'))
    expect(await screen.findByText('Lead riassegnato correttamente.')).toBeInTheDocument()
  })

  it('consente all’Operator di cambiare stato, aggiungere note e gestire task', async () => {
    currentUserRequest.mockResolvedValue({ id: 2, name: 'Anna', email: 'anna@example.test', role: 'operator', active: true })
    const lead = {
      id: 10,
      contact: { first_name: 'Luca', last_name: 'Verdi' },
      origin: { id: 3, name: 'Sito' },
      current_status: { id: 4, name: 'Nuovo', system_key: 'new', is_closed: false },
      current_assigned_user: { id: 2, name: 'Anna' },
      current_cycle_number: 1,
      recycle_count: 0,
      cycles: [{
        id: 20, cycle_number: 1, trigger: 'initial', started_at: '2026-08-27T10:00:00+02:00',
        assignments: [], status_history: [], notes: [], practice: { id: 30, status: 'open' },
        tasks: [{ id: 40, title: 'Richiamare', note: '', type: 'callback', status: 'pending', due_at: '2026-08-28T10:00:00+02:00' }],
      }],
    }
    getLead.mockResolvedValue(lead)
    getWorkflowStatuses.mockResolvedValue([
      { id: 4, name: 'Nuovo', system_key: 'new' },
      { id: 5, name: 'Interessato', system_key: 'interested' },
    ])
    const user = userEvent.setup()

    renderApp('/leads/10')
    await screen.findByRole('heading', { name: 'Gestisci lead' })
    await screen.findByRole('option', { name: 'Interessato' })
    expect(screen.getByText('Programma una nuova attività')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Promemoria' })).toHaveValue('follow_up')
    expect(screen.queryByRole('button', { name: 'Riassegna' })).not.toBeInTheDocument()
    expect(screen.queryByText(/follow-up/i)).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Stato'), '5')
    await user.click(screen.getByRole('button', { name: 'Aggiorna stato' }))
    await waitFor(() => expect(changeLeadStatus).toHaveBeenCalledWith(10, '5'))

    await user.type(screen.getByLabelText('Nota commerciale'), 'Cliente interessato')
    await user.click(screen.getByRole('button', { name: 'Aggiungi nota' }))
    await waitFor(() => expect(addLeadNote).toHaveBeenCalledWith(10, 'Cliente interessato'))

    await user.type(screen.getByLabelText('Titolo'), 'Inviare documenti')
    await user.type(screen.getAllByLabelText('Scadenza')[0], '2026-08-30T10:30')
    await user.click(screen.getByRole('button', { name: 'Crea attività' }))
    await waitFor(() => expect(createLeadTask).toHaveBeenCalledWith(10, expect.objectContaining({ type: 'callback', title: 'Inviare documenti' })))

    await user.selectOptions(screen.getByLabelText('Tipo'), 'follow_up')
    await user.type(screen.getByLabelText('Titolo'), 'Controllare la pratica')
    await user.type(screen.getAllByLabelText('Scadenza')[0], '2026-08-31T11:00')
    await user.click(screen.getByRole('button', { name: 'Crea attività' }))
    await waitFor(() => expect(createLeadTask).toHaveBeenLastCalledWith(10, expect.objectContaining({ type: 'follow_up', title: 'Controllare la pratica' })))

    await user.click(screen.getByRole('button', { name: 'Completa' }))
    await waitFor(() => expect(updateLeadTask).toHaveBeenCalledWith(40, { status: 'completed' }))
    expect(screen.getByRole('link', { name: 'Apri pratica' })).toHaveAttribute('href', '/practices/30')
  })

  it('consente all’Operator assegnato di creare la pratica del ciclo corrente', async () => {
    currentUserRequest.mockResolvedValue({ id: 2, name: 'Anna', email: 'anna@example.test', role: 'operator', active: true })
    getLead.mockResolvedValue({
      id: 10,
      contact: { first_name: 'Luca', last_name: 'Verdi' },
      origin: { id: 3, name: 'Sito' },
      current_status: { id: 4, name: 'Nuovo', system_key: 'new', is_closed: false },
      current_assigned_user: { id: 2, name: 'Anna' },
      current_cycle_number: 1,
      recycle_count: 0,
      cycles: [{
        id: 20, cycle_number: 1, trigger: 'initial', started_at: '2026-08-27T10:00:00+02:00', ended_at: null,
        assignments: [], status_history: [], notes: [], tasks: [], practice: null,
      }],
    })
    const user = userEvent.setup()

    renderApp('/leads/10')
    await user.click(await screen.findByRole('button', { name: 'Crea pratica' }))

    await waitFor(() => expect(createPractice).toHaveBeenCalledWith(10))
    expect(await screen.findByText('Pratica creata correttamente.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Riassegna' })).not.toBeInTheDocument()
  })

  it('impedisce all’Admin di programmare attività finché il lead non è assegnato', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getLead.mockResolvedValue({
      id: 10,
      contact: { first_name: 'Luca', last_name: 'Verdi' },
      origin: { id: 3, name: 'Sito' },
      current_status: { id: 4, name: 'Nuovo', system_key: 'new', is_closed: false },
      current_assigned_user: null,
      current_cycle_number: 1,
      recycle_count: 0,
      cycles: [{
        id: 20, cycle_number: 1, trigger: 'initial', started_at: '2026-08-27T10:00:00+02:00', ended_at: null,
        assignments: [], status_history: [], notes: [], tasks: [], practice: null,
      }],
    })

    renderApp('/leads/10')

    expect(await screen.findByText('Assegna prima un operatore al lead per programmare un’attività.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Crea attività' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Riassegna' })).toBeInTheDocument()
  })

  it('consente all’Admin di creare e modificare utenti', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getAdminUsers.mockResolvedValue([{ id: 2, name: 'Anna', email: 'anna@example.test', role: 'operator', active: true, created_at: '2026-08-20T10:00:00+02:00' }])
    const user = userEvent.setup()

    renderApp('/admin/users')
    expect(await screen.findByRole('heading', { name: 'Utenti' })).toBeInTheDocument()
    expect(await screen.findByText('anna@example.test')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Modifica' }))
    let dialog = screen.getByRole('dialog', { name: 'Modifica utente' })
    await user.click(within(dialog).getByLabelText('Account attivo'))
    await user.click(within(dialog).getByRole('button', { name: 'Salva utente' }))
    await waitFor(() => expect(updateAdminUser).toHaveBeenCalledWith(2, expect.objectContaining({ active: false, role: 'operator' })))
    expect(updateAdminUser.mock.calls[0][1]).not.toHaveProperty('password')

    await user.click(screen.getByRole('button', { name: 'Nuovo utente' }))
    dialog = screen.getByRole('dialog', { name: 'Nuovo utente' })
    await user.type(within(dialog).getByLabelText('Nome'), 'Paolo Neri')
    await user.type(within(dialog).getByLabelText('Email'), 'paolo@example.test')
    await user.type(within(dialog).getByLabelText('Password'), 'password123')
    await user.type(within(dialog).getByLabelText('Conferma password'), 'password123')
    await user.click(within(dialog).getByRole('button', { name: 'Salva utente' }))

    await waitFor(() => expect(createAdminUser).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Paolo Neri', email: 'paolo@example.test', role: 'operator', active: true,
    })))
  })

  it('consente all’Admin di modificare gli stati rispettando i campi protetti', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getLeadStatuses.mockResolvedValue([{ id: 4, name: 'Nuovo', system_key: 'new', sort_order: 1, active: true, is_closed: false, protected: true }])
    const user = userEvent.setup()

    renderApp('/admin/statuses')
    expect(await screen.findByRole('heading', { name: 'Stati lead' })).toBeInTheDocument()
    await screen.findByText('Protetto')
    await user.click(screen.getByRole('button', { name: 'Modifica' }))
    const dialog = screen.getByRole('dialog', { name: 'Modifica stato' })
    expect(within(dialog).getByLabelText('System key')).toBeDisabled()
    await user.clear(within(dialog).getByLabelText('Nome'))
    await user.type(within(dialog).getByLabelText('Nome'), 'Nuovissimo')
    await user.click(within(dialog).getByRole('button', { name: 'Salva' }))
    await waitFor(() => expect(updateLeadStatus).toHaveBeenCalledWith(4, expect.objectContaining({ name: 'Nuovissimo', system_key: 'new' })))
  })

  it('configura gli operatori e il round-robin di una provenienza', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getOrigins.mockResolvedValue([{ id: 3, code: 'site', name: 'Sito', active: true, operators: [] }])
    getOrigin.mockResolvedValue({ id: 3, operators: [] })
    getAdminUsers.mockResolvedValue([{ id: 2, name: 'Anna', role: 'operator', active: true }])
    const user = userEvent.setup()

    renderApp('/admin/origins')
    expect(await screen.findByRole('heading', { name: 'Provenienze' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Operatori' }))
    const dialog = await screen.findByRole('dialog', { name: 'Operatori · Sito' })
    await user.click(within(dialog).getByLabelText('Anna'))
    await user.click(within(dialog).getByRole('button', { name: 'Salva operatori' }))
    await waitFor(() => expect(updateOriginOperators).toHaveBeenCalledWith(3, [{ user_id: 2, receives_leads: true, sort_order: 0 }]))
  })

  it('mostra e riassegna un ricircolo corrente', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getRecycles.mockResolvedValue({ data: [{ cycle_id: 20, cycle_number: 2, lead: { id: 10, contact: { first_name: 'Luca', last_name: 'Verdi' } }, origin: { id: 3, name: 'Sito' }, reentered_at: '2026-08-27T10:00:00+02:00', previous_operator: { name: 'Paolo' }, current_operator: null, previous_outcome: { name: 'Non interessato', is_closed: true }, recycle_count: 1, can_reassign: true }], meta: { current_page: 1, last_page: 1, total: 1 } })
    getOrigin.mockResolvedValue({ id: 3, operators: [{ id: 2, name: 'Anna', active: true, receives_leads: true }] })
    const user = userEvent.setup()
    renderApp('/admin/recycles')
    expect(await screen.findByText('Luca Verdi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Riassegna' }))
    const dialog = await screen.findByRole('dialog', { name: 'Riassegna ricircolo' })
    await user.click(within(dialog).getByRole('button', { name: 'Riassegna' }))
    await waitFor(() => expect(assignRecycle).toHaveBeenCalledWith(20, '2'))
  })

  it('gestisce documenti e note di una pratica', async () => {
    currentUserRequest.mockResolvedValue({ id: 2, name: 'Anna', email: 'anna@example.test', role: 'operator', active: true })
    getPractice.mockResolvedValue({
      id: 30,
      status: 'open',
      opened_at: '2026-08-27T10:00:00+02:00',
      documents: [{ id: 40, name: 'Documento identità', status: 'uploaded', has_file: true, original_name: 'identita.pdf' }],
      notes: [{ id: 50, body: 'Documento atteso', author: { name: 'Anna' }, created_at: '2026-08-27T11:00:00+02:00' }],
    })
    const user = userEvent.setup()
    renderApp('/practices/30')

    expect(await screen.findByRole('heading', { name: 'Gestione pratica' })).toBeInTheDocument()
    expect(screen.getByText('Documento identità')).toBeInTheDocument()
    expect(screen.getByText('Documento atteso')).toBeInTheDocument()

    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:documento') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await user.click(screen.getByRole('button', { name: 'Scarica' }))
    await waitFor(() => expect(downloadDocument).toHaveBeenCalledWith(40))
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:documento')
    anchorClick.mockRestore()

    await user.type(screen.getByLabelText('Nome documento'), 'Busta paga')
    await user.click(screen.getByRole('button', { name: 'Aggiungi richiesta' }))
    await waitFor(() => expect(requestDocument).toHaveBeenCalledWith('30', 'Busta paga'))

    await user.type(screen.getByLabelText('Testo nota'), 'Verifica completata')
    await user.click(screen.getByRole('button', { name: 'Aggiungi nota' }))
    await waitFor(() => expect(addPracticeNote).toHaveBeenCalledWith('30', 'Verifica completata'))

    const file = new File(['pdf'], 'documento.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('File Documento identità'), file)
    await user.click(screen.getByRole('button', { name: 'Carica' }))
    await waitFor(() => expect(uploadDocument).toHaveBeenCalledWith(40, file))

    await user.selectOptions(screen.getByLabelText('Stato Documento identità'), 'verified')
    await waitFor(() => expect(updateDocument).toHaveBeenCalledWith(40, { status: 'verified' }))
  })

  it('avvia sync e risolve un mapping sospeso con rielaborazione', async () => {
    currentUserRequest.mockResolvedValue({ id: 1, name: 'Mario', email: 'mario@example.test', role: 'admin', active: true })
    getOrigins.mockResolvedValue([{ id: 3, name: 'Campagne Meta', active: true }])
    getIntegrationRuns.mockResolvedValue({
      data: [{ id: 70, run_uuid: 'run-70', trigger: 'manual', status: 'success', started_at: '2026-08-27T10:00:00+02:00', steps: [{ id: 71, source_system: 'meta', status: 'success' }] }],
      meta: { current_page: 1, last_page: 1, total: 1 },
    })
    getIntegrationMappings.mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, total: 0, mapping_required: [{ source_system: 'meta', external_key: 'campaign-123', external_label: 'Campagna Agosto', import_count: 2, latest_import_id: 90 }] },
    })
    const user = userEvent.setup()
    renderApp('/admin/integrations')

    expect(await screen.findByRole('heading', { name: 'Integrazioni' })).toBeInTheDocument()
    expect(await screen.findByText('Campagna Agosto')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sincronizza Site' }))
    await waitFor(() => expect(startIntegrationSync).toHaveBeenCalledWith('site'))

    await user.click(screen.getByRole('button', { name: 'Configura e rielabora' }))
    const dialog = screen.getByRole('dialog', { name: 'Risolvi mapping richiesto' })
    await user.selectOptions(within(dialog).getByLabelText('Provenienza CRM'), '3')
    await user.click(within(dialog).getByRole('button', { name: 'Crea e rielabora' }))
    await waitFor(() => expect(createIntegrationMapping).toHaveBeenCalledWith(expect.objectContaining({ source_system: 'meta', external_key: 'campaign-123', lead_origin_id: 3 })))
    expect(reprocessImport).toHaveBeenCalledWith(90)

    getIntegrationRun.mockResolvedValue(getIntegrationRuns.mock.calls.length ? { id: 70, run_uuid: 'run-70', trigger: 'manual', status: 'success', started_at: '2026-08-27T10:00:00+02:00', steps: [] } : {})
    await user.click(screen.getByRole('button', { name: 'Dettaglio' }))
    expect(await screen.findByRole('dialog', { name: 'Dettaglio sincronizzazione' })).toBeInTheDocument()
    expect(updateIntegrationMapping).not.toHaveBeenCalled()
  })
})
