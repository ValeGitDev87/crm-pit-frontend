# 04 — Routing and Layout

Route pubblica:
- `/login`

Route condivise:
- `/dashboard`
- `/leads`
- `/leads/:id`
- `/practices/:id`

Route Admin:
- `/admin/users`
- `/admin/statuses`
- `/admin/origins`
- `/admin/recycles`
- `/admin/integrations`

Sidebar Operator:
- Dashboard
- I miei lead

Sidebar Admin:
- Dashboard
- Lead
- Ricircoli
- Utenti
- Provenienze
- Stati
- Integrazioni

Topbar:
- nome utente
- ruolo
- logout
- menu mobile

Guest -> login.
Operator su URL Admin -> 403/redirect dashboard.
Admin -> accesso completo.
