# Testing and Release Verification

## Automated checks

```bash
npx tsc --noEmit
npx vitest run
npm run lint
npm run build
```

Tests in `tests/` cover registration, login, JWT cookie behavior, authorization and password-reset security. Previous developer output reported **36 passing tests**, but rerun on the intended release commit.

## Focused manual smoke tests (development only)

- Registration, verification, login, logout, password reset and old-session invalidation
- Admin-only access to admin pages and protected API endpoints
- Product listing, cart changes and Buy Now
- COD, bank transfer and WhatsApp order placement
- Inventory decrement, out-of-stock rejection and cancellation restoration
- PayHere sandbox success/failure/duplicate notification, if card payments are enabled
- Production flag `false`: card option hidden and initiation endpoint returns `403`

## Release blockers

Any failing build, broken login, incorrect role authorization, production database mismatch, stock inconsistency or accidental live card-payment enablement should block deployment.

## Evidence

Record the date, Git commit, environment, test results and any failed cases. Do not claim full end-to-end coverage solely from unit tests.
