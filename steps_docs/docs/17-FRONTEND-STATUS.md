# 17 — Frontend Status

| Fase | Stato |
|---|---|
| 01 Foundation, API Client e Auth | DONE |
| 02 Layout, Navigation e Design System | DONE |
| 03 Dashboard Admin e Operator | DONE |
| 04 Leads List | DONE |
| 05 Lead Detail Core | DONE |
| 06 Lead Actions | DONE |
| 07 Admin Users | DONE |
| 08 Admin Statuses e Origins | DONE |
| 09 Recycles | DONE |
| 10 Practices and Documents | DONE |
| 11 Integrations | DONE |
| 12 Demo Polish | DONE |
| 13 Frontend Freeze | DONE |

Stato generale: `DONE` — frontend MVP verificato e congelato.

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

## Blocco Fase 06 — RISOLTO

Data rilevazione: 2026-08-27.

Il contratto espone `PATCH /api/v1/leads/{lead}/status` anche nel gruppo autenticato condiviso, ma l'unica collection degli stati è `GET /api/v1/admin/lead-statuses`, protetta dal ruolo Admin. Non esiste un endpoint utilizzabile dall'Operator per ottenere l'elenco completo degli stati attivi e i relativi ID.

Impatto: il select di cambio stato Operator non può essere costruito in modo corretto. Gli ID non possono essere hardcodati e gli stati presenti nello storico del singolo lead non rappresentano l'elenco completo.

Risoluzione contrattuale necessaria, a scelta backend:

- esporre una collection read-only degli stati attivi agli utenti autenticati; oppure
- includere nel dettaglio lead una collection esplicita degli stati selezionabili per l'utente corrente.

Risoluzione applicata il 2026-08-27 su autorizzazione esplicita: aggiunta al backend la collection read-only `GET /api/v1/lead-statuses`, accessibile ad Admin e Operator autenticati e limitata agli stati attivi ordinati. Contratto backend e copia frontend aggiornati.

La Fase 06 è stata completata con cambio stato, note, creazione task, modifica scadenza, completamento/annullamento task e accesso alla pratica esistente. Nessun ID stato è hardcodato.

## Revisione UI lead — 2026-08-27

- Fase 04 aggiornata da tabella a griglia di card: 4 desktop, 3/2 responsive, 1 mobile;
- filtri e paginazione restano server-side;
- ogni card espone `Gestisci`;
- Admin visualizza il gestore corrente e le informazioni amministrative previste;
- le notifiche email sono registrate esclusivamente come POST-MVP e non implementate.
- Fase 07 completata il 2026-08-27: lista, creazione e modifica utenti, ruolo, stato attivo e password.
- Fase 08 completata il 2026-08-27: CRUD stati/provenienze e configurazione operatori per provenienza.
- Fase 09 completata il 2026-08-27: ricircoli, filtri/paginazione backend e riassegnazione eleggibile.
- Fase 10 completata il 2026-08-27: creazione e gestione pratica, richieste documentali, upload/download, stati documento e note pratica.
- Fase 11 completata il 2026-08-27: sync manuali Site/Meta, run e dettaglio, mapping, mapping richiesti e rielaborazione import.
- Fase 12 completata il 2026-08-27: audit responsive/accessibilità, copy italiana, feedback errore/successo, modali e vincoli upload.
- Fase 13 completata il 2026-08-27: audit route/API/errori, suite finale, build produzione e verifica patch Git.
- Branding definitivo applicato il 2026-08-27: il nome visuale e documentale del CRM è `Prestito in Tasca`.
- Fix autenticazione locale applicato il 2026-08-27: frontend e backend usano entrambi `localhost`, evitando la separazione dei cookie Sanctum tra `localhost` e `127.0.0.1`.
