# Output evals

## Automated cases

1. Pack math selects the lowest total packs, not the lowest displayed pack price.
2. Domain aliases match tomatoes, chicken thighs, parmesan, olive oil, arugula, and lemons.
3. Unsupported items remain absent and produce a warning.
4. Malformed values and unsupported units fail closed.
5. Export schema remains `supplier,item,quantity,unit,packs,line_total`.

## Quality gates for a live AI provider

- JSON schema pass rate: 100%
- Unsupported item fabrication: 0%
- Unit conversion without an explicit rule: 0%
- Low-confidence match flagged for review: 100%
- Price or savings claim not traceable to input rows: 0%
- P95 provider latency target: below 8 seconds
- Cost budget target: below $0.03 per successful plan

The live provider is intentionally disabled in preview because no model credential, shared rate limiter, or production cost gate is configured.
