# Deora — Full-Stack E-Commerce Platform

A full-stack e-commerce application for a Sri Lankan dry foods and beverages business, built with **Next.js App Router, React, TypeScript, Prisma and PostgreSQL**. It supports product discovery, authenticated checkout, order management, inventory tracking and an administrative workspace.

> **Project status:** Active development and release hardening. The repository includes security regression tests and payment integrations; a passing local build does not by itself establish production readiness.

## Features

- Responsive storefront, product catalogue, product detail pages and shopping cart
- Customer registration, login, email verification and password reset
- JWT-based authentication using an HTTP-only cookie and database-backed session version checks
- Checkout with **cash on delivery, bank transfer and WhatsApp** order methods
- Optional **PayHere card-payment flow**, controlled by an environment flag; sandbox testing should use development credentials
- Server-side price calculations and transaction-based stock decrements
- Admin workflows for products, inventory, orders and blog content
- Blog/vlog content model and AI-related endpoints
- Automated tests for important authentication and authorization behaviors

## Tech stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon), Prisma 7 with PostgreSQL adapter |
| Authentication | JWT, HTTP-only cookies, bcrypt password hashing |
| Payments | COD, bank transfer, WhatsApp; optional PayHere integration |
| Testing | Vitest, TypeScript, ESLint |
| Hosting | Vercel deployment configuration |

## Architecture

```text
Browser (Next.js / React)
  |-- Storefront, cart, checkout, admin UI
  v
Next.js API route handlers
  |-- Authentication + role checks
  |-- Product / cart / order operations
  |-- Payment initiation + notification
  |-- Inventory service (transactional updates)
  v
Prisma Client + PostgreSQL adapter
  v
Neon PostgreSQL

External integrations: PayHere, email/notification services, AI-related services
```

## Local setup

Requirements: Node.js, npm and a **development-only PostgreSQL database**.

```bash
npm ci
npx prisma generate
npm run dev
```

Create a local environment file containing the required settings. **Do not commit secrets.** Configure `DATABASE_URL`, `JWT_SECRET`, PayHere credentials (only when testing card payments), and any integrations you use. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for environment and migration precautions.

**Database migrations:** Review migration history and the target database before running `prisma migrate deploy`. Never point local development or seed commands at the production database by accident.

## Quality checks

```bash
npx tsc --noEmit
npx vitest run
npm run lint
npm run build
```

The authentication tests were reported passing during the November 2026 development review. Run the commands again for the current checkout before publishing results.

## Card-payment configuration

`NEXT_PUBLIC_CARD_PAYMENTS_ENABLED=false` hides the card option and blocks initiation through `/api/payment/initiate`. Development can set it to `true` with PayHere sandbox credentials. The flag is evaluated at build/runtime according to Next.js environment behavior; confirm the **deployed** Vercel environment, not only local `.env` files.

## Documentation

- [API endpoints](API_DOCUMENTATION.md)
- [Architecture and data flows](docs/ARCHITECTURE.md)
- [Authentication and security](docs/SECURITY.md)
- [Orders, payments and inventory](docs/ORDER_PAYMENT_FLOW.md)
- [Development and deployment](docs/DEPLOYMENT.md)
- [Testing and release checklist](docs/TESTING.md)
- [Engineering decisions and known limitations](docs/ENGINEERING_NOTES.md)
- [Portfolio case study](PORTFOLIO_CASE_STUDY.md)

## Repository note

The README and API documentation in the previous snapshot contained unresolved merge markers and outdated NextAuth references. This documentation set replaces those descriptions with a source-aligned overview. Deployment verification, live customer behavior and business impact should not be claimed without independent evidence.
