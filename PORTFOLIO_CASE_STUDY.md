# Deora E-Commerce — Portfolio Case Study

## Project summary

**Deora** is a full-stack e-commerce platform developed for a Sri Lankan dry foods and beverages storefront. The application combines a customer-facing shop with server-side order processing, inventory management, authentication and administrative workflows.

**Role:** Full-stack development and engineering hardening
**Stack:** Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL/Neon, Vercel
**Repository:** https://github.com/gmljayadewa/Deora-Full-stack-web-development

## The challenge

Building an online shop requires more than product cards: prices must be trustworthy, inventory must not go negative, only authorized users should access administrative functions, and payment events can arrive late or more than once.

## Solution

I developed a Next.js storefront and API layer with PostgreSQL persistence. The checkout flow validates requested items and calculates prices server-side, while inventory changes and order creation are coordinated using database transactions. Customer authentication uses JWT cookies and a session-version mechanism to invalidate sessions after password resets. Administrative operations use server-side authorization checks.

The checkout supports cash on delivery, bank transfer and WhatsApp. PayHere card payments are separated behind a feature flag while sandbox testing and additional payment lifecycle hardening continue.

## Engineering highlights

- Transactional order creation and conditional inventory decrement
- JWT authentication, admin role verification and session revocation
- Payment callback signature/amount checks and duplicate-state handling
- Regression tests for registration, login and authorization scenarios
- Development/production configuration separation

## Current status and next steps

The source includes implementation and automated security tests. Final production readiness still requires environment verification, end-to-end smoke testing, production migration review and stock-release handling for abandoned card payments before enabling live card processing.

## CV-ready project entry

**Deora E-Commerce Platform | Full-Stack Developer**
Built a full-stack e-commerce application using Next.js, TypeScript, Prisma and PostgreSQL. Implemented customer authentication, role-protected administration, product/cart/order APIs, transactional inventory updates and multiple checkout methods. Added security regression tests and improved payment-state validation and session revocation.

## Interview talking points

1. Trace a checkout request from React UI to the API route, transaction and PostgreSQL.
2. Explain how the server prevents client-side price tampering.
3. Show how stock decrements remain conditional and transactional.
4. Describe JWT session revocation and database-backed role checks.
5. Explain why payment notifications require signature verification and idempotency.

**Portfolio integrity:** Describe only work you can demonstrate and explain; do not claim production usage statistics or independently audited security without evidence.
