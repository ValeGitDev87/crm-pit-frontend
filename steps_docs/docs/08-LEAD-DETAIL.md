# 08 — Lead Detail

Endpoint:
`GET /api/v1/leads/{lead}`

Header:
- nome/cognome
- provenienza
- stato
- assegnatario
- ciclo
- ricircoli
- ultimo ingresso

Admin: azione Riassegna.

La card lead usa `Gestisci` come accesso unico a questa pagina. In gestione:

- Operator: cambio stato, note, richiami/task e accesso pratica quando disponibile;
- Admin: tutte le funzioni Operator, operatore corrente, riassegnazione e storico amministrativo consentito.

Anagrafica:
- email
- telefono
- data nascita
- professione
- residenza

Storico cicli come timeline o accordion, più recente prima.

Per ogni ciclo:
- data ingresso
- source system/raw origin
- importo
- stato finale
- operatori
- note
- task
- pratica

Admin reassignment:
`PATCH /api/v1/admin/leads/{lead}/assignment`

Non inventare operatori eleggibili.
