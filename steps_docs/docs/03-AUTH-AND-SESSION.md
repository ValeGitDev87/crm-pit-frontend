# 03 — Auth and Session

Flusso login:

```text
GET /sanctum/csrf-cookie
POST /api/v1/auth/login
GET /api/v1/auth/me se necessario
Dashboard per ruolo
```

Tutte le request usano `credentials: 'include'`.

Login page:
- email
- password
- loading
- validation error
- rate limit
- generic error

Bootstrap app: `GET /api/v1/auth/me`.
200 -> sessione valida.
401 -> guest.

Logout: `POST /api/v1/auth/logout`, poi pulire AuthContext e redirect `/login`.

419: richiedere CSRF e ritentare una sola volta quando sicuro.
401: pulire sessione UI e redirect login.
Nessun token in localStorage/sessionStorage.
