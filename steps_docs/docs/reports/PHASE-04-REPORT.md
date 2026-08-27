# Phase 04 Report — Leads List

Data: 2026-08-27  
Esito: `DONE`

## Ambito completato

- servizio centralizzato paginato `GET /api/v1/leads`;
- griglia responsive di card con cliente, provenienza, stato, operatore Admin, ciclo, ricircoli, ultimo ingresso e azione `Gestisci`;
- badge `Rientrato xN` e `Non assegnato`;
- link alla scheda lead;
- paginazione backend con totale e pagina corrente;
- filtri Admin per operatore, provenienza, stato, ricircolo, assegnazione, date e per-page;
- opzioni filtri ottenute dagli endpoint Admin congelati;
- vista Operator senza filtri Admin e con copy che chiarisce lo scope server-side;
- loading, errore/retry ed empty state.

## Verifiche

- `npm run lint`: superato;
- `npm test`: superato, 2 file e 12 test;
- `npm run build`: superato;
- test dedicati a riga lead, badge, paginazione e assenza dei filtri Admin per Operator.

## Contratto e dati

Le richieste usano soltanto i parametri documentati. La pagina corrente usa il parametro standard della collection paginata Laravel, necessario per la paginazione backend richiesta dal piano.

## Backend e versionamento

- backend consultato esclusivamente in lettura per confermare la forma delle risorse;
- nessun file backend modificato;
- nessun push eseguito.

## Blocchi

Nessun blocco funzionale o di contratto rilevato.

## Revisione decisione UI — 2026-08-27

La precedente presentazione a tabella è sostituita definitivamente da una griglia di card: 4 colonne desktop, riduzione progressiva e singola colonna mobile. Filtri e paginazione continuano a operare lato backend.
