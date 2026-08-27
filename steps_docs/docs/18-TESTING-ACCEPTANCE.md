# 18 — Testing and Acceptance

Frontend MVP accettato quando:
- login/logout funzionano;
- refresh mantiene sessione;
- Admin e Operator vedono menu diversi;
- dashboard funzionano;
- Admin vede lista lead con filtri;
- i lead sono mostrati in card responsive con pulsante Gestisci;
- Operator vede solo i propri;
- dettaglio lead mostra cicli e storico;
- note/task funzionano;
- ricircoli e riassegnazione funzionano;
- Admin gestisce utenti/provenienze;
- pratica/documenti funzionano;
- integrazioni consultabili;
- build produzione passa.

Test prioritari:
- auth
- role routing
- leads
- forms 422
- upload/download

Comandi se configurati:
```bash
npm run test
npm run lint
npm run build
```

`npm run build` è obbligatorio prima del freeze.
