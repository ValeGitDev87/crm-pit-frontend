# 01 — Local Development

Frontend:
`~/Desktop/prestitointasca/crm_pit/frontend`

Backend:
`~/Desktop/prestitointasca/crm_pit/backend`

Backend locale previsto:
`http://localhost:8000`

Frontend Vite previsto:
`http://localhost:5173`

Avvio frontend:
```bash
npm install
npm run dev
```

`.env.example` frontend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Il client deve costruire `/sanctum/csrf-cookie` e `/api/v1/...` sulla stessa base backend.

Usare lo stesso hostname (`localhost`) per frontend e backend: alternare `localhost` e `127.0.0.1` separa i cookie Sanctum e impedisce al frontend di leggere `XSRF-TOKEN`.

Non implementare workaround con token.
