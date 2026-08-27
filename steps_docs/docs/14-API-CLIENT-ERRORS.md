# 14 — API Client and Errors

Creare client comune `apiRequest(path, options)`.

Responsabilità:
- base URL;
- Accept JSON;
- credentials include;
- JSON encode;
- parse data/meta;
- error normalization;
- Blob/multipart.

Error object:
- status
- message
- fieldErrors
- retryAfter

401 -> user null + login.
403 -> permessi insufficienti.
404 -> not found.
419 -> CSRF bootstrap + un solo retry.
422 -> errori form.
429 -> messaggio e Retry-After.
500 -> messaggio generico.

Disabilitare submit durante richieste per evitare doppio invio.
