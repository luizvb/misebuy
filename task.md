# Build task

## Golden path

1. Load sample or paste supplier CSV.
2. Review matched items and pack-cost plan.
3. Export supplier-grouped CSV.

## Acceptance criteria

- Guest value before account or pricing.
- Aha target below 120 seconds.
- Output contains no fabricated items.
- Invalid inputs produce a recoverable error.
- Pricing appears only after a successful result.
- Data remains in the browser tab in preview.
- Desktop, mobile, dark theme, keyboard focus, and reduced motion pass smoke checks.
- Unit, build, E2E, dependency audit, and secret scan are recorded.

## Budgets

- Guest offers: 100 rows
- Guest needs: 12 planned items in commercial boundary
- Input units: 3 allowlisted units
- External AI requests: 0 in preview
- Guest storage: session-only event names, no source content
- Target client JS gzip: below 130 KB
