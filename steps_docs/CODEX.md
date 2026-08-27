# CODEX.md — Workflow Frontend

Prima di ogni fase leggere:
1. `AGENTS.md`
2. `CODEX.md`
3. `docs/00-FRONTEND-SCOPE.md`
4. `docs/16-FRONTEND-IMPLEMENTATION-PLAN.md`
5. `docs/17-FRONTEND-STATUS.md`
6. `docs/99-BACKEND-API-REFERENCE.md`
7. i documenti specifici della fase.

## Regola principale
Implementare UNA fase alla volta.

Se manca una regola UI puramente estetica, Codex può scegliere una soluzione professionale coerente.

Se manca una regola di business o un contratto API:
- NON inventare;
- fermarsi;
- documentare il blocco.

## Fine fase
Eseguire almeno:
```bash
npm run build
```

e, se presenti:
```bash
npm run test
npm run lint
```

Aggiornare `docs/17-FRONTEND-STATUS.md`.
Creare report fase.
Non fare push.
