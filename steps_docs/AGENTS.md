# AGENTS.md — Prestito in Tasca CRM Frontend

## 1. Scopo
Questo repository contiene esclusivamente il frontend React del CRM Prestito in Tasca.

Il backend Laravel è già implementato e l'API v1 è congelata. La fonte canonica del contratto backend inclusa in questo repository è:

`docs/99-BACKEND-API-REFERENCE.md`

Codex NON deve inventare endpoint, payload, ruoli, campi o regole backend non presenti nella reference.

## 2. Stack
- React
- Vite
- JavaScript salvo che il progetto esistente sia già TypeScript
- API Laravel separata
- Laravel Sanctum SPA cookie/sessione
- responsive desktop-first

Prima di aggiungere dipendenze, ispezionare `package.json`. Non introdurre framework UI pesanti senza necessità.

## 3. Repository separati
Frontend locale:
`~/Desktop/prestitointasca/crm_pit/frontend`

Backend locale:
`~/Desktop/prestitointasca/crm_pit/backend`

Non modificare file del repository backend durante l'implementazione frontend.

## 4. Autenticazione
Il backend NON usa Bearer token.

Il frontend deve:
1. chiamare `/sanctum/csrf-cookie`;
2. eseguire login;
3. usare sempre cookie/credentials;
4. mantenere lo stato utente tramite `/api/v1/auth/me`;
5. logout tramite endpoint backend.

NON salvare access token in localStorage/sessionStorage/cookie custom.

Gestire:
- 401 -> sessione assente/scaduta, tornare al login;
- 419 -> reinizializzare CSRF;
- 422 -> mostrare errori di validazione;
- 429 -> mostrare messaggio e rispettare Retry-After.

## 5. Ruoli
Solo:
- `admin`
- `operator`

La UI può nascondere sezioni in base al ruolo, ma il frontend non è autorità di sicurezza.

## 6. Design
Obiettivo: CRM finanziario professionale, pulito e presentabile.

Principi:
- sidebar desktop;
- topbar;
- dashboard a card;
- tabelle leggibili;
- badge per stati;
- responsive;
- stati loading/empty/error;
- niente lorem ipsum;
- dati reali API o DemoSeeder.

## 7. Regole dati
Non inventare:
- prodotti;
- team;
- fonti commerciali diverse dalle provenienze;
- stati non ricevuti dal backend;
- endpoint di merge contatti;
- endpoint Bearer;
- notifiche email/push.

## 8. Lead
Rappresentare chiaramente:
- contatto;
- provenienza;
- stato;
- assegnatario;
- numero ciclo;
- ricircoli;
- storico cicli;
- note;
- richiami/task;
- pratica;
- documenti.

Un ricircolo NON è un secondo lead: è un nuovo ciclo dello stesso lead.

## 9. API client
Centralizzare tutte le chiamate HTTP in `src/api/`. Non chiamare fetch direttamente da decine di componenti. Tutte le richieste devono usare credentials incluse.

## 10. State management
Per l'MVP evitare state manager globale pesante se non necessario. Usare Context per auth, stato locale per pagine/form e service API centralizzati.

## 11. Error handling
Ogni pagina deve avere loading, errore, empty state e successo. Le validazioni 422 devono essere mostrate vicino ai campi quando possibile.

## 12. Test
Se non esiste infrastruttura test frontend, introdurre soluzione leggera nella prima fase: Vitest + React Testing Library.

## 13. Git
Codex NON deve:
- fare push;
- modificare remote;
- riscrivere history;
- lavorare nel backend.

## 14. Reports
Al termine di ogni fase creare:
`docs/reports/PHASE-XX-REPORT.md`

Aggiornare sempre:
`docs/17-FRONTEND-STATUS.md`
