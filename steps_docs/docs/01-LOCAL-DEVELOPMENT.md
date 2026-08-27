# 01 — Local Development

Frontend:
`~/Desktop/prestitointasca/crm_pit/frontend`

Backend:
`~/Desktop/prestitointasca/crm_pit/backend`

Backend locale previsto:
`http://127.0.0.1:8000`

Frontend Vite previsto:
`http://localhost:5173`

Avvio frontend:
```bash
npm install
npm run dev
```

`.env.example` frontend:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Il client deve costruire `/sanctum/csrf-cookie` e `/api/v1/...` sulla stessa base backend.

Non implementare workaround con token.
