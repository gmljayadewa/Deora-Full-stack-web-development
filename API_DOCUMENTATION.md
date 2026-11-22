# Deora API Reference

**Base path:** `/api`
**Implementation:** Next.js App Router route handlers. Authentication uses a JWT HTTP-only cookie, **not NextAuth**.

The table below is generated from exported HTTP handler functions in the supplied source snapshot. An endpoint's presence does **not** imply it is publicly accessible. Refer to route code for exact request/response schemas, authorization and validation.

| Endpoint | Implemented methods |
| --- | --- |
| `/api/admin/blog` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/admin/categories` | `GET` |
| `/api/admin/inventory` | `GET`, `PATCH` |
| `/api/admin/products` | `GET` |
| `/api/ai` | `GET` |
| `/api/auth/forgot-password` | `POST`, `PUT` |
| `/api/auth/login` | `POST` |
| `/api/auth/logout` | `POST` |
| `/api/auth/me` | `GET` |
| `/api/auth/register` | `POST` |
| `/api/auth/verify-email` | `POST`, `PUT` |
| `/api/cart` | `POST` |
| `/api/chat` | `POST` |
| `/api/checkout` | `GET` |
| `/api/notification` | `GET` |
| `/api/orders` | `GET`, `POST` |
| `/api/orders/[orderId]` | `PATCH` |
| `/api/payment/initiate` | `POST` |
| `/api/payment/notify` | `POST` |
| `/api/products` | `GET`, `POST` |
| `/api/products/[id]` | `PUT`, `DELETE` |
| `/api/users` | `GET` |
| `/api/users/[id]` | `GET`, `PUT`, `DELETE` |

## Important request flows

### Authentication

- `POST /api/auth/register`: registration and verification workflow
- `POST /api/auth/login`: credentials validation and JWT session cookie
- `POST /api/auth/logout`: logout
- `GET /api/auth/me`: current authenticated user
- `POST /api/auth/forgot-password`: password-reset workflow; reset increments session version to invalidate previous sessions
- `/api/auth/verify-email`: email-verification handler (check source for accepted method and payload)

### Orders

`POST /api/orders` accepts a `paymentMethod` of `COD`, `BANK` or `WHATSAPP` plus `items` and `shippingAddress`. The server maps these values to payment enums, loads prices from PostgreSQL and decrements inventory in a Prisma transaction before creating the order. It does not accept `CARD` through this method map.

`GET /api/orders` is admin-restricted in this snapshot, **not** the customer order-history endpoint described in the old documentation.

### PayHere

`POST /api/payment/initiate` requires authentication and the enabled card-payment flag. It validates items, calculates prices on the server, creates an order/payment and returns PayHere initiation data.

`POST /api/payment/notify` accepts PayHere form-data notifications and checks merchant ID, MD5 signature, amount and currency before updating payment/order state. Failure/cancellation handling attempts to restore stock within a transaction.

## HTTP responses

Typical status codes include `200`, `201`, `400`, `401`, `403`, `404`, `409` and `500`, depending on the handler. Do not assume the same JSON envelope for every endpoint; consult each route's source or a tested API collection.

## Source of truth

This reference intentionally avoids inventing example payload fields or routes. For precise schemas, inspect `src/app/api/**/route.ts`, `src/lib/require-admin.ts` and `prisma/schema.prisma`.
