# 10 — Admin Users, Statuses and Origins

## Users
- lista
- crea
- modifica
- attiva/disattiva
- ruolo
- nuova password con conferma

## Statuses
- lista
- crea/modifica/elimina secondo backend
- system key immutabile quando assegnata
- stati protetti coerenti con backend

## Origins
- lista
- CRUD
- operatori associati
- receives_leads
- sort_order

Salvataggio operatori:
`PUT /api/v1/admin/origins/{origin}/operators`

Mostrare warning se nessun operatore riceve lead.
