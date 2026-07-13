# Security gate

## Preview posture

- Static deployment with no API endpoint.
- Supplier CSV stays in the current browser tab.
- Session analytics stores event names and numeric timing only.
- File parsing is bounded to 100 offer rows.
- Units are allowlisted.
- No URL fetch, upload, auth, tenant data, or destructive action.
- No purchase or supplier message is sent automatically.

## Production blockers before enabling AI

- Add a server-side secret store.
- Add IP/session rate limiting and daily spend caps.
- Enforce request size and structured response schemas.
- Redact supplier/customer identifiers from logs and traces.
- Add deletion/retention controls for saved price history.
- Run tenant-isolation E2E before team access.

Status: preview security gate passes. AI production gate remains closed.
