# Shared service contracts

## Read endpoint

`GET /governance/{initiativeId}/dashboard`

Returns metrics, findings, recommendations, source coverage, limitations and last scanned timestamp.

## Review endpoint

`POST /governance/{initiativeId}/review-requests`

Creates a review request or campaign item. It must not perform destructive remediation.

## Future dry-run endpoint

`POST /governance/{initiativeId}/operations/dry-run`

Returns impact summary only. Execute mode requires separate approval and audit.

## Required backend controls

- Least privilege.
- Correlation IDs.
- Throttling and retry handling.
- Source confidence per field.
- No sensitive payloads in frontend logs.
