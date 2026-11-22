# System Architecture and Data Model

## Layers

1. **UI:** `src/app` pages and `src/components` render storefront, checkout and admin experiences.
2. **API:** `src/app/api/**/route.ts` implements HTTP handlers.
3. **Authorization:** `src/lib/require-admin.ts` centralizes current-user and admin checks.
4. **Business logic:** `src/services/inventory.service.ts` handles stock changes inside transactions.
5. **Persistence:** Prisma models in `prisma/schema.prisma` map to PostgreSQL.

## Main entities

- `User` has a role, `sessionVersion`, optional `Cart`, and `Order` records.
- `Category` contains `Product` records; each `Product` has an optional `Inventory` record.
- `Cart` contains `CartItem` records; `Order` contains `OrderItem` records.
- `Order` has one optional `Payment` record. Payment method and status are explicit enums.
- `BlogPost` stores publication metadata, JSON sections and blog/vlog type.
- Password reset and email verification have dedicated token tables.

## Order data flow

```text
Customer checkout -> POST /api/orders -> requireAuth
  -> validate items and method -> read authoritative product prices
  -> Prisma transaction: decrement inventory + create order/items/payment
  -> return order ID and total
```

## Engineering principle

The browser supplies product IDs and quantities; the server must be the source of truth for prices, stock and access control. Keep development and production databases isolated.
