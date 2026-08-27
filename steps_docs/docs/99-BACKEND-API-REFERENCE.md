# 20 — API Reference v1 (Freeze React)

## Stato del contratto

Versione: `v1`  
Stato: **FROZEN PER FRONTEND REACT**  
Base path: `/api/v1`

Questa è la reference canonica del backend MVP. Il frontend non deve usare endpoint, campi o ruoli non elencati qui.

## Autenticazione SPA

Il backend usa Laravel Sanctum SPA con cookie di sessione e CSRF. Non emette Bearer token.

Sequenza frontend:

1. `GET /sanctum/csrf-cookie` con credenziali incluse;
2. `POST /api/v1/auth/login` con credenziali incluse;
3. tutte le chiamate successive con cookie e header CSRF gestito dal client;
4. `POST /api/v1/auth/logout` per invalidare la sessione corrente.

Esempio fetch:

```js
await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

await fetch('/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

L'origine React deve essere presente in `CORS_ALLOWED_ORIGINS` e `SANCTUM_STATEFUL_DOMAINS`.

## Convenzioni

Tutte le risposte JSON applicative hanno:

```json
{
  "data": {},
  "meta": {}
}
```

Le collection paginate espongono in `meta` almeno pagina corrente, ultima pagina, per-page e totale. Le date/ore sono ISO 8601. Gli ID sono interi.

Errori standard:

| HTTP | Significato |
|---:|---|
| 401 | sessione assente/non valida |
| 403 | ruolo, utente attivo o ownership insufficienti |
| 404 | risorsa inesistente o file non disponibile |
| 419 | CSRF/sessione SPA non inizializzata |
| 422 | validazione o regola di dominio |
| 429 | rate limit superato |
| 500 | errore interno non recuperabile |

Gli errori `422` seguono il formato Laravel:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Messaggio di validazione."]
  }
}
```

## Enum congelati

- ruolo: `admin|operator`;
- source system: `site|meta`;
- lead cycle trigger: `initial|recycle`;
- assignment: `automatic|recycle_automatic|manual`;
- task type: `callback|follow_up`;
- task status: `pending|completed|cancelled`;
- import status: `pending|processed|mapping_required|needs_review|failed`;
- run status: `running|success|partial|failed`;
- run trigger: `scheduler|manual`;
- practice status: `open|completed|cancelled`;
- document status: `requested|uploaded|verified|rejected`.

## Auth

### `POST /api/v1/auth/login`

Pubblico, guest, limite 5/minuto per email+IP.

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

`200`: utente autenticato (`id`, `name`, `email`, `role`, `active`). Credenziali errate: `422` su `email`.

### `GET /api/v1/auth/me`

Restituisce lo stesso profilo dell'utente di sessione.

### `POST /api/v1/auth/logout`

Invalida solo la sessione corrente e restituisce `data`/`meta` vuoti.

## Dashboard

### `GET /api/v1/dashboard`

Operator:

- `role=operator`;
- `counts`: `assigned_leads`, `new_leads`, `callbacks_today`, `overdue_tasks`, `in_progress`, `open_practices`;
- `new_leads[]`;
- `callbacks_today[]`;
- `overdue_tasks[]`;
- `open_practices[]`.

Le liste contengono soltanto elementi del ciclo corrente assegnato all'Operator autenticato.

Admin:

- `role=admin`;
- `global`: lead, aperti/chiusi, riciclati, cicli recycle, unassigned, pratiche aperte;
- `by_origin[]`;
- `by_operator[]`;
- `sync_status[]`, una voce per `site` e `meta`.

## Lead

### `GET /api/v1/lead-statuses`

Collection read-only degli stati attivi, ordinata per `sort_order` e ID. È disponibile sia ad Admin sia a Operator autenticati e fornisce gli ID validi per il cambio stato. Gli stati inattivi non sono inclusi.

### `GET /api/v1/leads`

Operator vede solo `current_assigned_user_id = auth.id`. I filtri Admin sono:

| Query | Tipo |
|---|---|
| `operator` | user ID |
| `origin` | origin ID |
| `status` | status ID |
| `recycled` | boolean |
| `unassigned` | boolean |
| `date_from` | data inclusiva su `last_received_at` |
| `date_to` | data inclusiva su `last_received_at` |
| `per_page` | 1–100, default 20 |

Ogni lead include contatto, provenienza, stato, assegnatario corrente, numero ciclo/ricircoli, date ingresso e ciclo corrente sintetico.

### `GET /api/v1/leads/{lead}`

Restituisce la scheda completa con:

- contatto e provenienza;
- stato/assegnatario correnti;
- tutti i cicli, più recente per primo;
- snapshot commerciale per ciclo;
- stato finale;
- storico assegnazioni;
- storico stati;
- note lead;
- task;
- eventuale pratica, documenti e note pratica.

Operator riceve `403` per lead non attualmente assegnati a lui.

### `PATCH /api/v1/leads/{lead}/status`

```json
{ "status_id": 7 }
```

Regole:

- stato attivo;
- history su cambio effettivo;
- stesso stato idempotente;
- stato chiuso chiude il ciclo;
- ciclo chiuso non si riapre;
- stato con `system_key=practice` crea/riusa una sola pratica per ciclo.

### `POST /api/v1/leads/{lead}/notes`

```json
{ "body": "Nota commerciale" }
```

`201`. La nota appartiene al ciclo corrente e conserva autore/data.

### `POST /api/v1/leads/{lead}/tasks`

```json
{
  "type": "callback",
  "title": "Richiamare il cliente",
  "note": "Dopo le 18",
  "due_at": "2026-08-30T18:00:00+02:00"
}
```

`201`, stato iniziale `pending`, assegnazione automatica all'operatore corrente. Lead unassigned: `422`.

### `PATCH /api/v1/lead-tasks/{task}`

Campi opzionali: `type`, `title`, `note`, `due_at`, `status`. `completed_at` viene gestito dal backend.

## Pratiche e documenti

### `POST /api/v1/leads/{lead}/practice`

Body vuoto. Porta il lead nello stato `practice` e crea/riusa la pratica del ciclo. È idempotente anche se la pratica è completed/cancelled.

### `GET /api/v1/practices/{practice}`

Restituisce pratica, creatore, documenti, uploader e note con autore.

### `POST /api/v1/practices/{practice}/documents`

```json
{ "name": "Documento identità" }
```

`201`, stato `requested`.

### `POST /api/v1/practice-documents/{document}/upload`

`multipart/form-data`, campo `file`. PDF/JPEG/PNG, massimo 10 MiB. Limite 20 upload/minuto per utente.

L'upload imposta `original_name`, `mime_type`, `size_bytes`, `uploaded_by`, `has_file=true`, stato `uploaded`.

### `PATCH /api/v1/practice-documents/{document}`

```json
{ "name": "Documento aggiornato", "status": "verified" }
```

`name` e `status` sono opzionali. `uploaded|verified|rejected` richiedono un file già caricato.

### `GET /api/v1/practice-documents/{document}/download`

Risposta binaria con `Content-Disposition: attachment`. Non esiste URL pubblico del file.

### `POST /api/v1/practices/{practice}/notes`

```json
{ "body": "Nota della pratica" }
```

`201`. Le note pratica sono separate dalle note commerciali lead.

## Admin — utenti

### `GET /api/v1/admin/users`

Lista utenti senza password/hash.

### `POST /api/v1/admin/users`

```json
{
  "name": "Mario Operatore",
  "email": "mario@example.com",
  "password": "password-min-8",
  "password_confirmation": "password-min-8",
  "role": "operator",
  "active": true
}
```

`role` default `operator`; `active` default true.

### `GET /api/v1/admin/users/{user}`

Dettaglio utente.

### `PATCH /api/v1/admin/users/{user}`

Campi opzionali: `name`, `email`, `password` + confirmation, `role`, `active`. Disattivare invalida tutte le sessioni dell'utente.

## Admin — stati lead

### `GET /api/v1/admin/lead-statuses`

Lista ordinata per `sort_order`.

### `POST /api/v1/admin/lead-statuses`

```json
{
  "name": "In valutazione",
  "system_key": null,
  "sort_order": 25,
  "active": true,
  "is_closed": false
}
```

### `GET /api/v1/admin/lead-statuses/{leadStatus}`

Dettaglio stato.

### `PATCH /api/v1/admin/lead-statuses/{leadStatus}`

Campi opzionali: `name`, `system_key`, `sort_order`, `active`, `is_closed`. Una `system_key` già assegnata è immutabile. Gli stati applicativi protetti non possono essere disattivati o alterati in modo incompatibile.

### `DELETE /api/v1/admin/lead-statuses/{leadStatus}`

Elimina soltanto uno stato non protetto e mai utilizzato.

## Admin — provenienze

### `GET /api/v1/admin/origins`

Lista con operatori/pivot e distribution state.

### `POST /api/v1/admin/origins`

```json
{ "code": "preventivi", "name": "Preventivi", "active": true }
```

`code`: lowercase `a-z0-9_-`, unique.

### `GET /api/v1/admin/origins/{origin}`

Dettaglio provenienza.

### `PATCH /api/v1/admin/origins/{origin}`

Campi opzionali: `code`, `name`, `active`.

### `DELETE /api/v1/admin/origins/{origin}`

Elimina soltanto provenienze mai usate da lead o mapping.

### `PUT /api/v1/admin/origins/{origin}/operators`

Sostituisce l'intera configurazione operatori:

```json
{
  "operators": [
    { "user_id": 10, "receives_leads": true, "sort_order": 0 },
    { "user_id": 11, "receives_leads": false, "sort_order": 1 }
  ]
}
```

Solo utenti con ruolo Operator; `user_id` non duplicati.

## Admin — assegnazioni e ricircoli

### `PATCH /api/v1/admin/leads/{lead}/assignment`

```json
{ "user_id": 10 }
```

Destinatario attivo, Operator, associato alla provenienza e `receives_leads=true`. Non modifica il cursore round-robin. `meta.idempotent` indica una richiesta sullo stesso assegnatario.

### `GET /api/v1/admin/recycles`

Filtri:

- `origin`;
- `current_operator`;
- `previous_operator`;
- `unassigned`;
- `date_from`, `date_to`;
- `per_page` 1–100.

Ogni riga è il recycle corrente e include lead/contatto, provenienza, data rientro, operatori precedente/corrente, esito precedente, conteggio ricircoli e `can_reassign`.

### `PATCH /api/v1/admin/recycles/{cycle}/assignment`

Payload `{ "user_id": 10 }`. Solo per il ciclo recycle corrente; usa le stesse regole della riassegnazione lead.

## Admin — integrazioni

### `GET /api/v1/admin/integrations/runs`

Run paginati, più recenti prima, con step e conteggi.

### `GET /api/v1/admin/integrations/runs/{run}`

Dettaglio run e step sito/Meta.

### `POST /api/v1/admin/integrations/site/sync`

### `POST /api/v1/admin/integrations/meta/sync`

Body vuoto. `202`: crea run `manual` in stato `running` e accoda il job. Limite condiviso 5/minuto per Admin.

### `GET /api/v1/admin/integrations/mappings`

Mapping paginati. `meta.mapping_required[]` riepiloga sorgenti/campagne sospese con:

- `source_system`;
- `external_key`;
- `external_label`;
- `import_count`;
- `latest_import_id`.

### `POST /api/v1/admin/integrations/mappings`

```json
{
  "source_system": "meta",
  "external_key": "campaign-123",
  "external_label": "Campagna Agosto",
  "lead_origin_id": 3,
  "active": true
}
```

Unique `source_system + external_key`.

### `PATCH /api/v1/admin/integrations/mappings/{mapping}`

Campi opzionali: `external_label`, `lead_origin_id`, `active`. Source/key non sono modificabili.

### `POST /api/v1/admin/integrations/imports/{import}/reprocess`

Body vuoto. Solo import `failed|mapping_required`; aggiorna la stessa riga. Limite 30/minuto per Admin.

## Sicurezza frontend

- usare sempre `credentials: include`;
- non salvare token: non esistono token client nell'MVP;
- non fidarsi del ruolo lato UI: il backend applica middleware/policy;
- gestire `401` tornando al login;
- gestire `419` reinizializzando CSRF/sessione;
- mostrare i campi di `errors` per `422`;
- rispettare `Retry-After` su `429`;
- non costruire URL storage: usare sempre l'endpoint download.

## Configurazione backend necessaria

```env
APP_URL=
APP_TIMEZONE=Europe/Rome
FRONTEND_URL=
SANCTUM_STATEFUL_DOMAINS=
CORS_ALLOWED_ORIGINS=

SITE_API_URL=
SITE_API_KEY=
SITE_API_LIMIT=200

META_GRAPH_VERSION=
META_AD_ACCOUNT_ID=
META_ACCESS_TOKEN=
```

Queue e scheduler devono essere attivi affinché le sync manuali/schedulate vengano elaborate.

## Fuori contratto MVP

- frontend React in questo repository;
- prodotti;
- analytics avanzati;
- notifiche email/push;
- assistente pratica diretto nel CRM;
- endpoint Bearer token;
- merge automatico contatti;
- deployment/VPS.
