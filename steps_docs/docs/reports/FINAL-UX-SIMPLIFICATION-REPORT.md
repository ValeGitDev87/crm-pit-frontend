# Final UX Simplification Report

Data: 2026-09-08  
Esito: completato

## File frontend modificati

- `src/pages/LeadsPage.jsx`
- `src/pages/LeadDetailPage.jsx`
- `src/components/leads/LeadActionsPanel.jsx`
- `src/pages/PracticePage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/utils/formatters.js`
- `src/App.css`
- `src/App.test.jsx`
- `steps_docs/docs/17-FRONTEND-STATUS.md`
- `steps_docs/docs/reports/FINAL-UX-SIMPLIFICATION-REPORT.md`

## File backend modificati

Nessuno. Il backend è stato ispezionato e testato in sola lettura, nel rispetto delle istruzioni del repository frontend.

## Verifica permessi Operator e causa degli eventuali 403

Non è stata rilevata una regressione di autorizzazione. Le policy correnti autorizzano l'Operator attivo quando il lead è assegnato a lui e il ciclo corrente è aperto:

- `LeadPolicy::work` copre cambio stato, note, creazione task e creazione pratica;
- `LeadTaskPolicy::update` copre modifica, completamento e annullamento dei task del ciclo corrente;
- `PracticePolicy::view/update` copre accesso e gestione di pratica, documenti e note pratica correnti;
- un Operator non owner riceve correttamente `403`.

I `403` previsti restano quindi quelli per lead assegnati ad altri, cicli/pratiche storici e funzioni Admin.

## Modifiche UX applicate

- verificato il branding visuale `Prestito in Tasca`; nessuna occorrenza Pincredit è presente nell'interfaccia;
- card lead mantenute responsive a 4/3/2/1 colonne e semplificate;
- etichette `Cliente` e `Gestore` rese visivamente distinte, con il gestore in evidenza;
- rimossi da card, filtri operativi e riepilogo principale ciclo, ricircoli e date di ingresso;
- i conteggi dashboard dei rientri sono presentati come `Clienti già presenti` / `Già presenti`;
- dettaglio lead riunito in un unico riepilogo con cliente, stato, provenienza, gestore e recapiti;
- storico tecnico mantenuto come sezione avanzata chiusa per impostazione predefinita;
- sostituita l'azione Admin con `Assegna operatore` o `Cambia gestore`, in base allo stato corrente;
- cambio stato e nota commerciale unificati in un solo form e un solo pulsante `Salva aggiornamento`;
- nessuna chiamata stato viene effettuata se lo stato non cambia e nessuna nota viene creata se vuota;
- in caso di stato e nota insieme la nota viene salvata per prima, così un eventuale stato di chiusura non impedisce di associarla al ciclo corrente;
- attività esposte soltanto come `Richiamo` e `Promemoria`, con testo role-aware e blocco chiaro sui lead non assegnati;
- `Richiedi documento` è stato sostituito da `Aggiungi documento`;
- stati documento tradotti in `Da ricevere`, `Ricevuto`, `Verificato`, `Da sostituire`;
- aggiunto `Vedi documenti (N)` nelle card solo quando la pratica corrente contiene documenti;
- il popup documenti è montato tramite portal fuori dalla card, mostra `Vedi` soltanto con `has_file=true` e usa l'endpoint autenticato esistente;
- `Vedi` apre un'anteprima protetta in una modale ampia (PDF tramite viewer incorporato, immagini direttamente) senza forzare il download;
- le azioni di cambio gestore non sono renderizzate per Operator.

Le informazioni documentali delle card vengono caricate in seconda battuta tramite il dettaglio lead protetto, senza rallentare la prima visualizzazione della lista e senza costruire URL storage pubblici.

## Comportamento cambio gestore

La riassegnazione manuale corrente:

- usa soltanto operatori attivi, associati alla provenienza e con `receives_leads=true` restituiti dalla configurazione della provenienza;
- mantiene lo stesso lead e lo stesso ciclo;
- non cambia lo stato e non crea ricircoli;
- chiude le assegnazioni aperte precedenti e crea una nuova assegnazione `manual`;
- aggiorna il gestore corrente;
- non aggiorna `LeadOriginDistributionState`, quindi non sposta il cursore round-robin;
- è idempotente quando viene selezionato il gestore già corrente.

## Task pendenti dopo cambio gestore

Il backend non modifica né riassegna i task pendenti durante il cambio manuale del gestore. I task conservano quindi `assigned_user_id` del vecchio operatore. Il vecchio operatore perde l'ownership del lead e non può più modificarli; il nuovo gestore può modificarli perché la policy verifica l'ownership corrente del lead e del ciclo, non l'`assigned_user_id` del task.

Questo è il comportamento reale attuale. Non è stato introdotto un comportamento business diverso nel frontend. Se in futuro si desidera trasferire esplicitamente anche l'assegnatario dei task, servirà una decisione business e una modifica backend dedicata; non è un blocco per i fix UX richiesti.

## Test backend

- `php artisan test`: PASS, 131 test e 777 asserzioni;
- `./vendor/bin/pint --test`: PASS.

La suite copre owner/non-owner, stato, note, task, pratica/documenti, riassegnazione manuale, round-robin e cicli/ricircoli.

## Test frontend

- `npm run lint`: PASS;
- `npm test -- --run`: PASS, 24 test;
- `npm run build`: PASS.

La suite aggiornata verifica inoltre il form unificato nei casi solo nota, solo stato e stato+nota, l'assenza dei termini tecnici nella card/riepilogo, le etichette gestore, il portal del popup documenti, il pulsante `Vedi` vincolato alla presenza del file e l'anteprima blob protetta.

Il browser integrato non era disponibile nella sessione; non è stato quindi eseguito un collaudo visuale manuale. I breakpoint 4/3/2/1 sono stati verificati nel CSS e le interazioni sono coperte dai test frontend disponibili.

## Decisioni business ancora necessarie

Nessuna decisione blocca questa consegna. Rimane soltanto la decisione post-MVP, non necessaria per questi fix, sull'eventuale trasferimento automatico dei task pendenti quando cambia il gestore.

Nessun push eseguito.
