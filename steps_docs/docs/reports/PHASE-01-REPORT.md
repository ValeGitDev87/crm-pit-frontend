# Phase 01 Report — Foundation, API Client e Auth

Data: 2026-08-27  
Esito: `DONE`

## Ambito completato

- ispezione e sostituzione dello scaffold Vite iniziale;
- configurazione `VITE_API_BASE_URL` in `.env.example`;
- client API centralizzato con `credentials: include`;
- inizializzazione CSRF Sanctum e singolo retry automatico su `419`;
- normalizzazione errori `401`, `403`, `419`, `422`, `429` e `5xx`;
- servizi `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`;
- `AuthProvider` con bootstrap sessione, login, logout e invalidazione globale su `401`;
- pagina login responsive con errori di campo e stato di invio;
- route protetta `/dashboard`, redirect guest e placeholder autenticato;
- dipendenze leggere per routing e test.

## Contratto API

L'implementazione segue `99-BACKEND-API-REFERENCE.md`: autenticazione stateful tramite cookie, nessun bearer token e nessuna persistenza in `localStorage`.

## Verifiche

- `npm run lint`: superato;
- `npm test`: superato, 2 file e 6 test;
- `npm run build`: superato con Vite 8.2.2;
- verifica coperta: cookie/CSRF, retry `419`, normalizzazione `422/429`, restore sessione, redirect guest, login ed errori campo;
- verifica browser visuale non eseguita perché il controllo browser integrato non era disponibile nella sessione; non è un blocco funzionale.

## File principali

- `src/api/client.js`, `src/api/auth.js`;
- `src/context/AuthProvider.jsx`, `src/hooks/useAuth.js`;
- `src/pages/LoginPage.jsx`, `src/pages/DashboardPage.jsx`;
- `src/App.jsx`, `src/App.css`, `src/index.css`;
- test in `src/api/client.test.js` e `src/App.test.jsx`.

## Backend e versionamento

- nessun file backend modificato;
- nessun push eseguito.

## Blocchi

Nessun blocco funzionale o di contratto rilevato.
