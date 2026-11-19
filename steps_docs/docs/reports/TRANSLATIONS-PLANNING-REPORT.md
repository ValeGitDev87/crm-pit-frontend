# Traduzioni, leggibilita e planning

Data: 2026-09-16  
Esito: completato, salvo il limite contrattuale documentato sul colore degli stati

## Interventi completati

- centralizzata nel client API la traduzione in italiano degli errori HTTP e dei comuni messaggi di validazione Laravel;
- mantenuti invariati i messaggi gia restituiti in italiano dal backend;
- aumentati contrasto, dimensione e peso dei testi secondari piu importanti;
- aggiunta la voce condivisa `Planning` alla navigazione Admin e Operator;
- aggiunte le viste settimanale e mensile per richiami e promemoria pendenti, con navigazione tra periodi e collegamento diretto al lead;
- rispettato lo scope dei ruoli: l'Admin vede i lead disponibili alla propria API, l'Operator soltanto quelli assegnati;
- usati esclusivamente endpoint esistenti del contratto congelato, senza modifiche backend.

In assenza di un endpoint globale per i task, il planning pagina i lead visibili e ne carica i dettagli in batch limitati, aggregando soltanto le attivita pendenti del ciclo corrente.

## Verifica Operator

Non e stata rilevata una regressione che impedisca a un normale Operator di inserire o aggiornare dati nel proprio perimetro. La suite backend verifica le operazioni consentite su lead assegnato e ciclo corrente aperto, compresi stato, note, task e pratica/documenti.

Restano intenzionalmente vietati con `403`:

- lead assegnati a un altro operatore;
- cicli e pratiche storici;
- funzioni riservate all'Admin.

## Colore degli stati: limite reale del contratto

La scelta persistente di un colore da parte dell'Admin non e implementabile soltanto nel frontend: `lead_statuses` non espone un campo `color` nella migration, nel model, nelle request o nelle resource API.

Serve una modifica backend esplicita al contratto e al database. Non e stato usato `localStorage` o un altro salvataggio locale, perche produrrebbe configurazioni incoerenti tra utenti e dispositivi.

## File interessati

- `src/utils/errorTranslations.js`
- `src/api/client.js`
- `src/api/client.test.js`
- `src/api/leads.js`
- `src/pages/PlanningPage.jsx`
- `src/components/layout/AppShell.jsx`
- `src/App.jsx`
- `src/App.test.jsx`
- `src/index.css`
- `src/App.css`
- `steps_docs/docs/17-FRONTEND-STATUS.md`
- `steps_docs/docs/reports/TRANSLATIONS-PLANNING-REPORT.md`

## Verifiche finali

- `npm run lint`: PASS;
- `npm test -- --run`: PASS, 27 test;
- `npm run build`: PASS;
- `php artisan test`: PASS, 131 test e 777 asserzioni;
- `./vendor/bin/pint --test`: PASS;
- `git diff --check`: PASS su frontend e backend.

Nessun file backend modificato. Nessun push eseguito.
