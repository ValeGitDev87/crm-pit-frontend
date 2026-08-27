import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthLoadingState } from './components/feedback/AuthLoadingState'
import { SessionErrorState } from './components/feedback/SessionErrorState'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './hooks/useAuth'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { DashboardPage } from './pages/DashboardPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { LoginPage } from './pages/LoginPage'
import { LeadsPage } from './pages/LeadsPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function ProtectedRoute() {
  const { isAuthenticated, loading, authError, refreshMe } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingState />
  if (authError) return <SessionErrorState message={authError.message} onRetry={refreshMe} />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <Outlet /> : <ForbiddenPage />
}

function HomeRedirect() {
  const { isAuthenticated, loading, authError, refreshMe } = useAuth()

  if (loading) return <AuthLoadingState />
  if (authError) return <SessionErrorState message={authError.message} onRetry={refreshMe} />
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/practices/:id" element={<ComingSoonPage title="Pratica" description="Documenti e avanzamento della pratica." />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<ComingSoonPage title="Utenti" description="Gestione degli account CRM." />} />
            <Route path="/admin/statuses" element={<ComingSoonPage title="Stati lead" description="Configurazione del flusso commerciale." />} />
            <Route path="/admin/origins" element={<ComingSoonPage title="Provenienze" description="Canali e distribuzione agli operatori." />} />
            <Route path="/admin/recycles" element={<ComingSoonPage title="Ricircoli" description="Lead rientrati e riassegnazioni." />} />
            <Route path="/admin/integrations" element={<ComingSoonPage title="Integrazioni" description="Sincronizzazioni sito e Meta." />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
