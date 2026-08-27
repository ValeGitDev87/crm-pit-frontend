# Phase 06 Report — Lead Actions

Data: 2026-08-27  
Esito: `BLOCKED`

## Verifica preliminare richiesta dal piano

Prima di costruire il select stato Operator sono stati verificati:

- `16-FRONTEND-IMPLEMENTATION-PLAN.md`;
- `09-NOTES-TASKS-STATUS.md`;
- il contratto congelato `99-BACKEND-API-REFERENCE.md`;
- il registro route backend locale, esclusivamente in lettura.

## Gap contrattuale

Sono disponibili:

- `PATCH /api/v1/leads/{lead}/status`, accessibile agli utenti autenticati secondo ownership/policy;
- `GET /api/v1/admin/lead-statuses`, protetto da middleware `role:admin`.

Non è disponibile una collection read-only degli stati attivi accessibile all'Operator. Il dettaglio lead restituisce lo stato corrente e lo storico, ma questi dati non costituiscono l'elenco completo degli stati selezionabili.

## Perché è bloccante

Il payload di cambio stato richiede un `status_id`. Senza una fonte contrattuale degli ID validi, il frontend dovrebbe hardcodare ID, dedurre dati incompleti oppure chiamare un endpoint non autorizzato. Tutte e tre le opzioni violano le istruzioni del progetto.

## Risoluzione richiesta al backend

È necessaria una delle seguenti estensioni del contratto:

1. endpoint autenticato read-only che restituisca gli stati attivi ordinati;
2. collection `available_statuses`/equivalente nel dettaglio lead, con semantica e campi documentati.

Il nome della soluzione e il payload devono essere definiti nel contratto backend; il frontend non li assume.

## Attività non eseguite

Per rispettare la regola “una fase alla volta”, non sono state implementate parzialmente note, task o update task. Le fasi 07–13 non sono state avviate.

## Backend e versionamento

- nessun file backend modificato;
- nessun push eseguito.
