# 15 — Demo Flow

Backend:
```bash
php artisan serve
php artisan queue:work
php artisan schedule:work
```

Frontend:
```bash
npm run dev
```

Percorso Admin:
1. Login
2. Dashboard
3. Lead + filtri
4. Lead ricircolato
5. Riassegnazione
6. Provenienze/operatori
7. Pratica/documenti
8. Integrazioni

Percorso Operator:
1. Login Operator
2. Dashboard personale
3. I miei lead
4. Cambio stato
5. Nota/richiamo
6. Pratica

Non dipendere da Meta live per la demo. DemoSeeder è il percorso principale.

## Post-MVP

Le azioni rilevanti del CRM dovranno generare notifiche email al diretto interessato. Il dettaglio evento -> destinatario sarà definito dopo il completamento MVP.
