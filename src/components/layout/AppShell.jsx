import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { useAuth } from '../../hooks/useAuth'

const SHARED_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/leads', label: 'Lead', operatorLabel: 'I miei lead', icon: 'L' },
]

const ADMIN_ITEMS = [
  { to: '/admin/recycles', label: 'Ricircoli', icon: 'R' },
  { to: '/admin/users', label: 'Utenti', icon: 'U' },
  { to: '/admin/origins', label: 'Provenienze', icon: 'P' },
  { to: '/admin/statuses', label: 'Stati', icon: 'S' },
  { to: '/admin/integrations', label: 'Integrazioni', icon: 'I' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const items = user?.role === 'admin' ? [...SHARED_ITEMS, ...ADMIN_ITEMS] : SHARED_ITEMS

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-scrim" aria-label="Chiudi menu" type="button" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Navigazione principale">
        <div className="sidebar-brand"><span>P</span><strong>Prestito in Tasca</strong><small>CRM</small></div>
        <nav>
          <p className="nav-section">Workspace</p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {user?.role === 'operator' && item.operatorLabel ? item.operatorLabel : item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">{user?.name?.charAt(0).toUpperCase()}</div>
          <div><strong>{user?.name}</strong><small>{user?.email}</small></div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button className="mobile-menu-button" type="button" aria-label="Apri menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="breadcrumb"><span>CRM</span><strong>{location.pathname.split('/').filter(Boolean).at(-1) || 'dashboard'}</strong></div>
          <div className="topbar-profile">
            <div><strong>{user?.name}</strong><Badge tone={user?.role === 'admin' ? 'blue' : 'neutral'}>{user?.role === 'admin' ? 'Admin' : 'Operator'}</Badge></div>
            <button className="logout-link" type="button" disabled={loggingOut} onClick={handleLogout}>{loggingOut ? 'Uscita…' : 'Esci'}</button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  )
}
