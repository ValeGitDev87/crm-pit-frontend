# 12 — Practices and Documents

Pratica:
`GET /api/v1/practices/{practice}`

Creazione:
`POST /api/v1/leads/{lead}/practice`

Document request:
`POST /api/v1/practices/{practice}/documents`

Upload:
`POST /api/v1/practice-documents/{document}/upload`

Usare `FormData`. Non impostare manualmente il boundary.

UI accept:
- PDF
- JPG/JPEG
- PNG
- max 10 MiB

Download:
`GET /api/v1/practice-documents/{document}/download`

Usare blob browser e revocare object URL.

Note pratica:
`POST /api/v1/practices/{practice}/notes`

Stati documento:
requested, uploaded, verified, rejected.
