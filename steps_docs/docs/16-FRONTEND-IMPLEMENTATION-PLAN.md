# 16 — Frontend Implementation Plan

## Fase 01 — Foundation, API Client e Auth
- scaffold inspection
- env
- API client
- CSRF
- login
- AuthContext
- logout
- protected routes
- error handling base
- test auth
- build

## Fase 02 — Layout, Navigation e Design System
- sidebar
- topbar
- responsive
- componenti comuni
- 403/404/loading/error/empty
- route role-aware

## Fase 03 — Dashboard Admin e Operator
- `/dashboard`
- card
- liste operative
- sync status

## Fase 04 — Leads List
- griglia lead a card (4 desktop, 3/2 intermedi, 1 mobile)
- filtri Admin
- paginazione
- badge Nuovo/Rientrato/Pratica/non assegnato
- pulsante Gestisci

## Fase 05 — Lead Detail Core
- anagrafica
- stato
- provenienza
- operatore
- storico cicli
- snapshot
- assignment/history

## Fase 06 — Lead Actions
- area Gestisci condivisa Admin/Operator
- cambio stato
- note
- task
- update task
- feedback UI

Prima di implementare il select stato Operator verificare che il contratto consenta di ottenere la lista stati. Se no, fermarsi.

## Fase 07 — Admin Users
- lista
- create
- edit
- active
- role
- password

## Fase 08 — Admin Statuses e Origins
- status CRUD
- origins CRUD
- operator association
- receives_leads
- sort_order

## Fase 09 — Recycles
- lista
- filtri
- reassignment

## Fase 10 — Practices and Documents
- pratica
- document request
- upload
- status
- download
- note pratica

## Fase 11 — Integrations
- runs
- run detail
- Site/Meta sync
- mappings
- mapping_required
- reprocess

## Fase 12 — Demo Polish
- loading
- empty states
- confirm
- responsive
- copy italiana
- accessibility
- build/test

## Fase 13 — Frontend Freeze
- verifica route
- audit errors
- production build
- final report
- nessun backend change
