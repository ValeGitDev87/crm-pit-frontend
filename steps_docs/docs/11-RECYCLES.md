# 11 — Admin Recycles

Route:
`/admin/recycles`

Endpoint:
`GET /api/v1/admin/recycles`

Colonne:
- Cliente
- Provenienza
- Data rientro
- Operatore precedente
- Operatore corrente
- Esito precedente
- Numero ricircoli
- Azioni

Filtri:
- origin
- current_operator
- previous_operator
- unassigned
- date_from
- date_to

Riassegna:
`PATCH /api/v1/admin/recycles/{cycle}/assignment`

Dopo successo refresh lista/riga e conferma.
