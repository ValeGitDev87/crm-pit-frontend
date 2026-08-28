# Fix Operator Actions — Report

Data: 2026-08-27

## Esito

Il problema di autenticazione percepito come `Unauthorized`/`403` era già stato risolto uniformando frontend e backend sullo stesso hostname locale (`localhost`). L'uso misto di `localhost` e `127.0.0.1` separava i cookie Sanctum/XSRF e impediva alla SPA di mantenere correttamente la sessione.

Le policy backend per l'Operator assegnato erano già conformi e non sono state disabilitate o allargate. Il controllo ha individuato due problemi frontend ancora aperti:

- terminologia tecnica `Follow-up` ancora visibile;
- form task disponibile all'Admin anche sui lead non assegnati, nonostante il backend rifiuti correttamente la creazione.

## Modifiche backend

Nessun file applicativo backend modificato. Sono stati ampliati soltanto i test di regressione:

- `tests/Feature/Leads/LeadNotesTasksApiTest.php`;
- `tests/Feature/Practices/PracticesDocumentsTest.php`.

La copertura aggiunta verifica il divieto di modificare task, pratica e documenti appartenenti a cicli storici e rafforza i casi di Operator non assegnato.

## Modifiche frontend

- `src/components/leads/LeadActionsPanel.jsx`: testi role-aware, mapping visibile `Promemoria`, blocco esplicito della creazione task per lead non assegnato;
- `src/pages/LeadDetailPage.jsx`: passaggio del ruolo corrente al pannello operativo;
- `src/utils/formatters.js`: `follow_up` visualizzato come `Promemoria`;
- `src/App.test.jsx`: test Operator/Admin, Richiamo/Promemoria, pratica, assenza riassegnazione Operator e blocco task non assegnato;
- `steps_docs/docs/09-NOTES-TASKS-STATUS.md`: regole UI aggiornate;
- `steps_docs/docs/17-FRONTEND-STATUS.md`: stato fix registrato.

## Policy e controller verificati

- `LeadPolicy`: Operator attivo limitato al lead assegnato e al ciclo corrente aperto per le azioni operative;
- `LeadTaskPolicy`: update consentito soltanto sul task del ciclo corrente del proprio lead;
- `PracticePolicy`: update pratica limitato al ciclo corrente aperto del proprio lead;
- `PracticeDocumentPolicy`: autorizzazioni ereditate dalla pratica;
- controller note/task/pratica/documenti: usano Form Request e policy esistenti; nessuna correzione applicativa necessaria.

## Test

Verifiche mirate iniziali:

- backend: 22 test superati, 138 assertion;
- frontend: 22 test superati.

Verifiche finali:

- backend: 131 test superati, 777 assertion;
- backend Pint: superato;
- frontend lint: superato;
- frontend: 22 test superati;
- frontend build di produzione: superata.

## Limiti residui

Nessun limite funzionale rilevato nel contratto API MVP. Le notifiche email restano POST-MVP e non sono state implementate.

Il controllo browser interattivo non è disponibile nell'ambiente corrente; i medesimi flussi UI sono stati verificati con React Testing Library e i relativi endpoint con i test Feature Laravel.
