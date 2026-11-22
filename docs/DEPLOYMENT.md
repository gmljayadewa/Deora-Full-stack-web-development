# Local Development and Deployment Guide

## Local

```bash
npm ci
npx prisma generate
npx tsc --noEmit
npx vitest run
npm run build
npm run dev
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string; **development database locally** |
| `JWT_SECRET` | JWT signing/verification secret |
| `AUTH_SECRET` | Present in local configuration; check consuming code before relying on it |
| `NEXT_PUBLIC_CARD_PAYMENTS_ENABLED` | `false` in Production; optional `true` for development sandbox |
| `PAYHERE_MERCHANT_ID` | PayHere merchant identifier |
| `PAYHERE_MERCHANT_SECRET` | PayHere signature secret |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact configuration |
| `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | AI integration settings |
| `APP_URL` | Application URL configuration |

Do not publish actual values. The complete list may evolve; inspect `process.env` usage before deployment.

## Migration safety

- Confirm the exact target database and migration history before running `prisma migrate deploy`.
- Development migration history was previously reconciled manually; **do not copy that baseline procedure blindly to Production**.
- Back up production data and review pending SQL before applying schema changes.
- `prisma/seed-blogs.ts` writes blog records; run only after confirming a development database target.

## Vercel release sequence

1. Push reviewed changes to the development branch.
2. Deploy a preview against the development database and sandbox integrations.
3. Run smoke tests (auth, cart, checkout, admin, inventory, payments).
4. Independently verify production environment variables and pending migrations.
5. Merge/promote the reviewed release, monitor logs and confirm rollback path.

**Release status:** Production migration and end-to-end smoke-test results were not provided in the uploaded source archive; do not mark them complete.
