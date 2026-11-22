# Authentication and Security Notes

## Implemented patterns

- JWT-based session stored in an HTTP-only cookie; this is **not NextAuth**.
- Authentication and admin authorization helpers in `src/lib/require-admin.ts`.
- Password-reset workflow increments `User.sessionVersion` to revoke older sessions.
- Admin authorization verifies the current user/role rather than trusting only a stale role claim.
- Checkout and card-payment initiation derive prices from database product records.
- PayHere notification checks merchant ID, signature, amount and currency before processing.
- Authentication regression tests are in `tests/`.

## Security boundaries

1. Client-side visibility is not authorization: every privileged API handler needs server-side checks.
2. Never commit `.env` files, JWT secrets, payment secrets or database connection strings.
3. Use development/sandbox payment credentials for local tests.
4. Validate Vercel Production/Preview environment separation before deployment.
5. Keep logs free of credentials, tokens and customer personal data.

## Remaining verification

- Confirm rate limiting, input validation and error handling on every externally reachable route.
- Test access control for customer vs admin, including direct API calls.
- Exercise duplicate/out-of-order payment notifications and cancelled-order transitions.
- Verify secure-cookie behavior under HTTPS on the actual deployment.

This document records code-level design, not a completed penetration test or certification.
