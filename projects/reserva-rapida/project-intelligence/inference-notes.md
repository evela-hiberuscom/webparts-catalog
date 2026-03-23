# Inference Notes

- The Airtable spec for `Reserva rápida` is sufficient, but the actual SharePoint list schema is not defined in detail.
- Fallback field mapping for `BookingResourcesList` assumes common names: `Title`, `Category`, `Site`, `BookingUrl`, `Availability`, `Rules`, `Featured`, `Priority`.
- If the real source list differs, the repository should adapt the mapping layer without changing the UI contract.
- `resourcesJson` is an explicit static configuration path for `StaticConfig`; it is not used as an implicit demo fallback when the configured source is empty or fails.
