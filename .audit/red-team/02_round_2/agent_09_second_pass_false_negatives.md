# RONDA 2 — Agent 09 — Falsos negativos

| ID | Posible omisión | Severidad | Evidencia | Acción |
| --- | --- | --- | --- | --- |
| FN-001 | JsonUrl arbitrario en mis-accesos-recientes | Medium | JsonRecentAccessesRepository.ts fetch(this._url) | Validar same-origin/allowlist |
| FN-002 | Falta allowlist de protocolo en window.open | Medium | 5 _blank desde campos configurables | Helper seguro de enlaces |
| FN-003 | localStorage en pulso con respuesta/usuario | Low-Medium | dailyPulseRepository.ts | TTL/purga/documentación |
| FN-004 | 17 lockfiles desincronizados | Medium | R2 supply | npm ci por proyecto |
| FN-005 | Scanner no parsea JSONC manifests | Info/coverage | json-parse-errors.json | jsonc-parser |
