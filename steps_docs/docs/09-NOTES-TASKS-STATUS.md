# 09 — Status, Notes and Tasks

Cambio stato:
`PATCH /api/v1/leads/{lead}/status`

Stati attivi selezionabili, condivisi Admin/Operator:
`GET /api/v1/lead-statuses`

Note:
`POST /api/v1/leads/{lead}/notes`

Task:
`POST /api/v1/leads/{lead}/tasks`

Update task:
`PATCH /api/v1/lead-tasks/{task}`

Task form:
- type
- title
- note
- due_at

Mapping UI definitivo dei tipi:
- `callback` → `Richiamo`;
- `follow_up` → `Promemoria`.

La form usa il titolo `Programma attività`. L'Operator vede `Programma una nuova attività`; l'Admin vede il nome dell'operatore destinatario. Se il lead non è assegnato, la creazione è nascosta e viene richiesto di assegnare prima un operatore.

Azioni rapide:
- completa
- modifica data
- annulla

Le azioni sono disponibili nella pagina aperta dal pulsante `Gestisci` della card lead. Admin e Operator usano gli stessi endpoint condivisi nel rispetto delle policy backend; Admin dispone inoltre della riassegnazione.

## Punto di controllo completato
Gli stati Admin completi sono disponibili da `/api/v1/admin/lead-statuses`.
La collection read-only degli stati attivi per il workflow è disponibile da `/api/v1/lead-statuses`.

Prima di costruire il select stato per Operator, verificare se il contratto/API espone in modo utilizzabile l'elenco stati anche all'Operator.

Il frontend non hardcoda ID e usa esclusivamente la collection condivisa per il select di cambio stato.
