# 17 — Frontend Status

| Fase | Stato |
|---|---|
| 01 Foundation, API Client e Auth | DONE |
| 02 Layout, Navigation e Design System | DONE |
| 03 Dashboard Admin e Operator | DONE |
| 04 Leads List | DONE |
| 05 Lead Detail Core | DONE |
| 06 Lead Actions | BLOCKED |
| 07 Admin Users | TODO |
| 08 Admin Statuses e Origins | TODO |
| 09 Recycles | TODO |
| 10 Practices and Documents | TODO |
| 11 Integrations | TODO |
| 12 Demo Polish | TODO |
| 13 Frontend Freeze | TODO |

Stato generale: `BLOCKED` — gap contrattuale nella Fase 06.

Backend API v1 congelata.
Usare `docs/99-BACKEND-API-REFERENCE.md`.

Se emerge un limite reale del contratto backend, registrarlo qui prima di inventare workaround.

## Note operative

- Fase 01 completata il 2026-08-27: client API cookie-based, CSRF Sanctum, login/logout, bootstrap `/auth/me`, route protetta ed errori base.
- Nessuna modifica backend eseguita.
- Nessun blocco di contratto rilevato nella Fase 01.
- Fase 02 completata il 2026-08-27: shell responsive, navigazione role-aware, componenti comuni e route 403/404.
- Nessun blocco di contratto rilevato nella Fase 02.
- Fase 03 completata il 2026-08-27: dashboard API con viste Admin/Operator, card, liste operative e stato sync.
- Nessun blocco di contratto rilevato nella Fase 03.
- Fase 04 completata il 2026-08-27: lista lead role-aware, filtri Admin, badge e paginazione backend.
- Nessun blocco di contratto rilevato nella Fase 04.
- Fase 05 completata il 2026-08-27: scheda lead, storico cicli/snapshot, assegnazioni/stati e riassegnazione Admin vincolata alla provenienza.
- Nessun blocco di contratto rilevato nella Fase 05.

## Blocco attivo — Fase 06

Data rilevazione: 2026-08-27.

Il contratto espone `PATCH /api/v1/leads/{lead}/status` anche nel gruppo autenticato condiviso, ma l'unica collection degli stati è `GET /api/v1/admin/lead-statuses`, protetta dal ruolo Admin. Non esiste un endpoint utilizzabile dall'Operator per ottenere l'elenco completo degli stati attivi e i relativi ID.

Impatto: il select di cambio stato Operator non può essere costruito in modo corretto. Gli ID non possono essere hardcodati e gli stati presenti nello storico del singolo lead non rappresentano l'elenco completo.

Risoluzione contrattuale necessaria, a scelta backend:

- esporre una collection read-only degli stati attivi agli utenti autenticati; oppure
- includere nel dettaglio lead una collection esplicita degli stati selezionabili per l'utente corrente.

La Fase 06 non è stata implementata parzialmente. Le fasi successive restano `TODO` fino alla risoluzione del contratto.
