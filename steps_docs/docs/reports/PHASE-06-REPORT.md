# Phase 06 Report — Lead Actions

Data: 2026-08-27  
Esito: `DONE`

## Gap contrattuale risolto

La verifica preliminare aveva confermato che l'Operator poteva inviare `status_id` ma non ottenere gli stati disponibili. Su nuova autorizzazione esplicita è stata introdotta la modifica backend minima:

- `GET /api/v1/lead-statuses` nel gruppo autenticato condiviso;
- restituisce esclusivamente stati attivi ordinati;
- accessibile ad Admin e Operator;
- testata contro accesso anonimo e presenza di stati inattivi;
- reference backend e copia frontend aggiornate.

Nessuna regola della pipeline è stata modificata e nessun ID è hardcodato nel frontend.

## Ambito completato

- area `Gestisci lead` condivisa per Admin e Operator;
- cambio stato tramite collection workflow;
- aggiunta note al ciclo corrente;
- creazione task `callback|follow_up`;
- modifica data task;
- completamento e annullamento task;
- accesso alla pratica quando presente;
- feedback di successo, errori generici e validazioni `422` vicino ai campi;
- submit disabilitati durante le richieste;
- Admin mantiene inoltre riassegnazione, gestore e storico amministrativo.

## Revisione card lead

La Fase 04 è stata corretta secondo la decisione UI definitiva:

- griglia a 4 card su desktop;
- riduzione progressiva a 3, 2 e 1 card;
- badge di stato, ricircolo, pratica e non assegnato quando applicabili;
- informazioni operative e gestore Admin;
- pulsante `Gestisci` su ogni card;
- paginazione e filtri sempre backend.

## Verifiche

- frontend `npm run lint`: superato;
- frontend `npm test`: superato, 2 file e 14 test;
- frontend `npm run build`: superato;
- backend test mirati: 7 test e 51 asserzioni superati;
- controllo browser visuale non disponibile nella sessione; rendering e interazioni coperti con React Testing Library.

## Post-MVP

Le notifiche email sono state documentate come evoluzione successiva. Nessuna email è stata implementata.

## Versionamento

Nessun push eseguito.
