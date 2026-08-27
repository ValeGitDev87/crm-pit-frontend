# Phase 05 Report — Lead Detail Core

Data: 2026-08-27  
Esito: `DONE`

## Ambito completato

- scheda `GET /api/v1/leads/{lead}` con gestione `403`, `404`, loading ed errore/retry;
- header con contatto, provenienza, stato, assegnatario, ciclo e ricircoli;
- anagrafica completa e date di ingresso;
- storico cicli più recente prima tramite accordion nativo;
- snapshot commerciale per ciclo;
- timeline assegnazioni e storico stati;
- riepilogo read-only di note, task e pratica per ciclo;
- azione Admin di riassegnazione;
- recupero operatori eleggibili dal dettaglio della provenienza;
- esclusione esplicita di operatori inattivi o con `receives_leads=false`;
- gestione errore `422` sulla riassegnazione e conferma di successo.

## Verifiche

- `npm run lint`: superato;
- `npm test`: superato, 2 file e 13 test;
- `npm run build`: superato;
- test dedicato a dettaglio, ciclo, storico e riassegnazione con operatore eleggibile.

## Regole di dominio rispettate

Ogni ricircolo è rappresentato come ciclo dello stesso lead. Gli operatori di riassegnazione non sono inventati né ricavati dalla lista utenti generica: provengono dalla configurazione della provenienza restituita dal backend.

## Backend e versionamento

- backend consultato esclusivamente in lettura per confermare la forma delle risorse annidate;
- nessun file backend modificato;
- nessun push eseguito.

## Blocchi

Nessun blocco funzionale o di contratto rilevato nella Fase 05.
