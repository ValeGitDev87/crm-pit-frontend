# 07 — Leads List

Endpoint:
`GET /api/v1/leads`

Admin filtri dinamici sopra la griglia:
- operator
- origin
- status
- recycled
- unassigned
- date_from
- date_to
- per_page

Operator: il backend restituisce solo i suoi lead. Il frontend non carica tutto per filtrare localmente.

## Presentazione definitiva

I lead devono essere presentati come card, non come tabella.

- desktop: griglia di 4 card per riga;
- viewport intermedi: riduzione progressiva a 3 e 2 card;
- mobile: 1 card per riga;
- paginazione e filtri restano backend;
- ogni card espone il pulsante `Gestisci`.

Contenuti minimi card:

- Cliente
- Provenienza
- Stato
- Ultimo ingresso
- Ciclo
- Ricircoli
- Informazioni operative utili disponibili nel payload

Admin vede inoltre:

- operatore corrente;
- badge `Non assegnato` quando applicabile;
- informazioni amministrative consentite dal contratto.

Badge obbligatori quando applicabili:

- `Nuovo`;
- `Rientrato xN`;
- `Pratica`;
- `Non assegnato`.

Usare paginazione backend.
