# 13 — Admin Integrations

Route:
`/admin/integrations`

Sezioni:
- Stato generale
- Run
- Site
- Meta
- Mapping richiesti

Run:
`GET /api/v1/admin/integrations/runs`
`GET /api/v1/admin/integrations/runs/{run}`

Sync:
`POST /api/v1/admin/integrations/site/sync`
`POST /api/v1/admin/integrations/meta/sync`

Mapping:
`GET /api/v1/admin/integrations/mappings`
`POST /api/v1/admin/integrations/mappings`
`PATCH /api/v1/admin/integrations/mappings/{mapping}`

Reprocess:
`POST /api/v1/admin/integrations/imports/{import}/reprocess`

Meta mapping_required:
campagna sospesa -> scegli provenienza -> crea mapping -> reprocess.

Il backend registra `needs_review`, ma la reference non definisce un endpoint di risoluzione contatto. NON inventare UI operativa di risoluzione.
