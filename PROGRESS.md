# Deora E-Commerce - Development Progress Log

Personal project log tracking daily/weekly progress following the 12-week SDLC roadmap.

---

## Week 1 - Requirement Engineering (Completed)

### ✅ Day 1 - Business Requirements
- Studied Deora business model (natural herbal/wellness products: capsules, powders, tea, spices)
- Identified target products, customers, and business problems
- Created Project Overview, Problem Statement, Project Objectives
- Problem Statement: Deora needs a digital platform to sell products online and automate customer communication

### ✅ Day 2 - Requirement Gathering
- Identified actors:
  - **Customer**: Browse products, purchase products, track orders
  - **Admin**: Manage products, manage inventory, manage orders
  - **External Systems**: Payment Gateway, WhatsApp API, Email Service, AI Assistant
- Created Actor List
- Drafted initial Functional & Non-Functional Requirements

### ✅ Day 3 - SRS Document
- Wrote full Functional Requirements (FR-AUTH, FR-CAT, FR-CART, FR-CHK, FR-ORD, FR-INV, FR-ADM)
- Wrote Non-Functional Requirements (Security, Performance, Reliability, Compliance, SEO)
- Document follows IEEE/ISO/IEC 29148:2018 standard

### ✅ Day 4 - UML Behavioral Models
- Created Use Case Diagram (Actors: Customer, Admin, Payment Gateway, n8n, OpenAI)
- Created Activity Diagram (Browse → Add Cart → Checkout → Payment → Order Confirmation)

### ✅ Day 5 - UML Structural Models
- Created Class Diagram (User, Customer, Admin, Product, Category, Cart, CartItem, Order, OrderItem, Payment, Inventory)
- Created ER Diagram (database entities & relationships, UUID primary keys)

### ✅ Day 6 - Sequence Diagrams
- Created Order Placement Sequence Diagram
  Flow: Customer → Frontend → API → Database → n8n → Email/WhatsApp Notification

### ✅ Day 7 - Review & Finalize
- ✅ SRS completed (v1.0)
- ✅ All UML diagrams completed (Use Case, Activity, Class, ER, Sequence)
- ✅ User stories completed
- ✅ Technology stack approved: Next.js, TypeScript, Node.js/Express, PostgreSQL, Prisma, AWS, Vercel, n8n, OpenAI

---

## Week 2 - System Design & UI/UX Design (Completed)

### ✅ Day 1 - System Architecture
- Designed high-level architecture flow:
  Next.js (Frontend) → API Layer → Prisma ORM → PostgreSQL
- Mapped external integrations: OpenAI, n8n, WhatsApp, Email Service
- Full system architecture diagram created

### ✅ Day 2 - Database Design
- Identified core database tables: User, Product, Category, Cart, CartItem, Order, OrderItem, Payment, Inventory
- Mapped entity relationships (1:1, 1:many)

### ⏳ Day 3 - Prisma Schema Design (Planning Only)
- ER diagram finalized as reference
- Actual `schema.prisma` file implementation moved to Week 3 (alongside Next.js setup) for better workflow continuity

### ✅ Day 4-5 - Figma UI Design
- **Customer pages designed**: Homepage, About Us, Product Page (tabs: Description/Ingredients/Benefits/How to Use/Reviews), Categories, Blogs & Events, Login, Cart, Checkout
- **Admin pages designed**: Dashboard, Product Management, Order Management
- Brand color palette finalized: Primary #1B4332 (Forest Green), Secondary #E8B84B (Gold), Background #F7F5F0 (Cream)

**Scope simplification decisions (for MVP/timeline fit):**
- Checkout: 4-step wizard → simplified to single-page checkout
- Login: Removed social login (Google/Facebook/Apple) → email/password only, matches SRS FR-AUTH scope
- Admin panel: Removed charts, multi-filters, pagination, bulk actions, export → kept core CRUD tables only
- Advanced features (dynamic blog CMS, analytics dashboard) documented as Future Enhancements in SRS Section 5.4

### ✅ Day 6 - API Planning (Draft)
Planned core API routes:
- `GET /api/products`
- `POST /api/orders`
- `POST /api/auth/login`
- `PUT /api/inventory`

(Full implementation planned for Week 6 - Backend API Development phase)

### ✅ Day 7 - Architecture Review
- Reviewed full system design against SRS requirements
- Confirmed tech stack alignment: Next.js + TypeScript + Prisma + PostgreSQL + NextAuth.js

### 💡 Key Learning - Scope Management
Original Figma designs were feature-rich beyond SRS scope and 10-week timeline. Made a pragmatic engineering decision to simplify to MVP-level designs matching actual FR/NFR requirements, with advanced features deferred to "Future Enhancements."

---

## Week 3 - Environment Setup & Authentication (In Progress)

### ✅ Day 1-2 - Project Setup
- Created Next.js project: TypeScript ✅, ESLint ✅, Tailwind CSS ✅, `src/` directory ✅, App Router ✅, React Compiler ❌, AGENTS.md ❌
- Verified dev server running successfully (`npm run dev` → localhost:3000)
- Connected local repo to GitHub remote

**Git troubleshooting (real-world skills gained):**
- Fixed branch mismatch: local `master` vs GitHub default `main` → used `git branch -M main`
- Resolved README.md merge conflict (GitHub repo had existing README, local had none) → manual conflict resolution
- Successfully pushed to GitHub after `git pull --allow-unrelated-histories` + conflict fix

**Useful commands learned:**
```bash
git remote add origin <repo-url>
git remote -v
git remote set-url origin <new-url>
git branch -M main
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### ✅ Project Folder Structure
Created organized `src/` structure:
```
src/
├── app/          → Next.js pages/routes
├── components/   → Reusable UI components
├── services/     → API call logic
├── lib/          → Database connection, Prisma client
└── utils/        → Helper functions
```

### ⏳ Next - Day 3: Prisma + PostgreSQL Setup
- [ ] Choose database: Cloud (Neon.tech / Supabase) vs Local PostgreSQL
- [ ] `npm install prisma @prisma/client`
- [ ] `npx prisma init`
- [ ] Set `DATABASE_URL` in `.env`
- [ ] Define `User`, `Product`, `Category` models in `schema.prisma`
- [ ] `npx prisma migrate dev`

### ⏳ Parallel Task
- Next.js crash course (video-based learning, active-watching method: pause + type along)

---

## 🎯 Overall Status Summary

| Phase | Status |
|---|---|
| Week 1 - Requirement Engineering | ✅ Complete |
| Week 2 - System Design & UI/UX | ✅ Complete |
| Week 3 - Setup & Auth | ⏳ In Progress (Day 1-2 done) |
| Week 4-12 | 🔜 Upcoming |

**Target deadline:** October 30, 2026