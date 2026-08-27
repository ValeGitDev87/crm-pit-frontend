# 02 — Frontend Architecture

Struttura consigliata:

```text
src/
  api/
    client.js
    auth.js
    dashboard.js
    leads.js
    admin.js
    practices.js
    integrations.js
  components/
    layout/
    common/
    forms/
    tables/
    feedback/
  context/
    AuthContext.jsx
  hooks/
  pages/
    auth/
    admin/
    operator/
    leads/
    practices/
  utils/
    dates.js
    errors.js
    formatters.js
  styles/
```

Adattare alla struttura esistente senza refactor inutili.

Componenti pagina orchestrano. Moduli API parlano col backend. Componenti riutilizzabili non devono conoscere URL API.

`AuthProvider` mantiene `user`, `loading`, `login`, `logout`, `refreshMe`.

Protected routes richiedono sessione; Admin routes richiedono anche `user.role === 'admin'` lato UI.
