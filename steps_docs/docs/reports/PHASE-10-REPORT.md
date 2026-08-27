# Phase 10 Report — Practices and Documents

Data: 2026-08-27  
Esito: `DONE`

## Ambito completato

- creazione pratica dal ciclo corrente del lead;
- dettaglio pratica con stato, documenti e note;
- richiesta di un nuovo documento;
- upload `FormData` PDF/JPG/PNG con controllo UI del limite 10 MiB;
- aggiornamento stato documento (`requested`, `uploaded`, `verified`, `rejected`);
- download protetto come blob con revoca dell'object URL;
- aggiunta note pratica;
- loading, errore/retry, feedback azioni ed empty state.

## Verifiche

- `npm run lint`: superato;
- `npm test -- --run`: superato, 2 file e 19 test;
- `npm run build`: superato;
- test dedicato a richieste documentali, note, upload e cambio stato.

## Backend e versionamento

- nessuna modifica backend nella fase;
- nessuna email implementata;
- nessun push eseguito.

## Blocchi

Nessun blocco funzionale o di contratto rilevato.
