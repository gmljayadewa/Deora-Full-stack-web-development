# Engineering Decisions and Limitations

## Decisions worth explaining in interviews

**Why calculate prices on the server?** Browser totals can be modified; the backend loads current product prices from PostgreSQL before creating an order.

**Why a database transaction for orders?** Stock decrement and order/payment creation must succeed or fail together.

**Why conditional stock decrement?** `quantity >= requested` prevents two concurrent checkouts from selling the same final units under the normal transaction path.

**Why check the admin role against the database?** A role embedded in an old JWT can become stale when permissions change.

**Why `sessionVersion`?** Incrementing it after a password reset invalidates previously issued sessions without maintaining a per-token blacklist.

**Why a card-payment feature flag?** Production can expose COD/bank/WhatsApp while card integration remains under sandbox testing; the initiation API also enforces the flag.

## Known gaps

- No verified automatic expiry/release for abandoned PayHere pending orders.
- Chargebacks need a manual review workflow.
- The uploaded archive alone cannot confirm live Vercel environment settings, production migrations or successful customer purchases.
- Keep API examples synchronized with actual route code; avoid outdated NextAuth references.

## Interview explanation framework

For each feature, explain **user problem -> API entry point -> validation -> database operations -> failure handling -> test -> trade-off**. Demonstrate with one specific source file instead of memorizing a generic architecture description.
