# MiseBuy

Compare weekly restaurant supplier lists and export a ready-to-place buying plan.

## Why this exists

Independent restaurant buyers receive inconsistent item names, pack sizes, and prices across supplier files. MiseBuy normalizes the comparison, keeps human review in control, and groups selected lines into supplier-specific order lists.

## Guest demo

1. Open the landing page.
2. Select **Load sample**.
3. Review the buying plan and estimated savings.
4. Export the plan as CSV.

The public preview uses a deterministic, local matching provider. It does not upload supplier data or place orders. The schema-bound provider interface is ready for a live AI matcher after rate limiting, a cost budget, and model evals are configured.

## Development

```bash
pnpm install
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm dev
```

## Architecture

- React + TypeScript + Vite
- Pure comparison core in `src/core/compare.ts`
- Provider contract in `src/core/provider.ts`
- Session-only anonymous event names for activation, TTV, error, export, and upgrade intent
- Local guest data and no backend in preview

## Safety and limits

- 100 offer rows maximum in guest mode
- Strict unit allowlist: `kg`, `l`, `each`
- No automatic purchasing
- No claim that a result is the lowest market price
- Unmatched items remain unmatched
- No PII or supplier content in analytics

See `docs/security.md` and `docs/evals.md`.

## Venture pair

[MiseBuy Prep](https://github.com/luizvb/misebuy-prep) is the free companion tool. It cleans one supplier file locally. MiseBuy remains the product that compares multiple suppliers and creates the buying decision.

- Product: https://misebuy.netolabs.dev
- Free tool: https://misebuy-prep.netolabs.dev

## License

MIT
