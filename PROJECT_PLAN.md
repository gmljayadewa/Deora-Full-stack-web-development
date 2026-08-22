# Deora Project — Corrected 12-Week Plan (Actual Dates)

**Status check (Aug 22, 2026):** Week 1 ✅ | Week 2 ✅ | Week 3 🔄 In Progress (Day 4)

---

## ✅ WEEK 1 (Aug 1 – Aug 7): Requirement Engineering — COMPLETE

SRS document, UML diagrams (Use Case, Activity, Class, ER, Sequence), tech stack approved.

## ✅ WEEK 2 (Aug 9 – Aug 16): System Design & UI/UX — COMPLETE

Architecture design, database design, Figma UI (customer + admin pages), API planning draft.

---

## 🔄 WEEK 3 (Aug 18 – Aug 24): Environment Setup & Authentication — IN PROGRESS

| Day     | Date                                  | Task                                                                           | Status         |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------ | -------------- |
| Day 1-2 | Aug 18-19                             | Next.js + TypeScript + Tailwind setup, GitHub connected, folder structure      | ✅ Done        |
| Day 3   | Aug 20                                | PostgreSQL (Neon) + Prisma schema (all models) + migration                     | ✅ Done        |
| Day 4   | Aug 21                            | Auth Part 1: bcrypt setup, Prisma Client config (Prisma 7 fixes), Register API | 🔄 In Progress |
| Day 5   | Aug 22                                | Auth Part 2: Login API + NextAuth.js session setup                             | ⏳ Upcoming    |
| Day 6   | Aug 23                               | Auth Part 3: Logout, validation, error handling                                | ⏳ Upcoming    |
| Day 7   | Aug 24  | Test auth end-to-end                                                           | ⏳ Upcoming    |


---

## WEEK 4 (Aug 25 – Aug 31): Website UI Development

| Day   | Date   | Task                                     |
| ----- | ------ | ---------------------------------------- |
| Day 1 | Aug 25 | Navbar, Footer, Layout                   |
| Day 2 | Aug 26 | Homepage: Hero section                   |
| Day 3 | Aug 27 | Homepage: Categories + Featured products |
| Day 4 | Aug 28 | Product cards                            |
| Day 5 | Aug 29 | Search + Filter                          |
| Day 6 | Aug 30 | Product Details Page (`/products/[id]`)  |
| Day 7 | Aug 31 | UI testing (mobile/tablet/desktop)       |

## WEEK 5 (Sep 1 – Sep 7): Cart & Checkout Frontend

| Day   | Date  | Task                              |
| ----- | ----- | --------------------------------- |
| Day 1 | Sep 1 | Cart: Add product                 |
| Day 2 | Sep 2 | Cart: Remove product              |
| Day 3 | Sep 3 | Cart: Update quantity + total     |
| Day 4 | Sep 4 | Checkout: Customer details form   |
| Day 5 | Sep 5 | Checkout: Address + Order summary |
| Day 6 | Sep 6 | Responsive testing                |
| Day 7 | Sep 7 | Review frontend, fix bugs         |

## WEEK 6 (Sep 8 – Sep 14): Backend API Development

| Day   | Date   | Task                       |
| ----- | ------ | -------------------------- |
| Day 1 | Sep 8  | API folder structure       |
| Day 2 | Sep 9  | Product API: Get products  |
| Day 3 | Sep 10 | Product API: Add product   |
| Day 4 | Sep 11 | Product API: Update/Delete |
| Day 5 | Sep 12 | User APIs                  |
| Day 6 | Sep 13 | Test all APIs              |
| Day 7 | Sep 14 | API documentation          |

## WEEK 7 (Sep 15 – Sep 22): Order, Inventory & Payment ⚠️ +1 day buffer

| Day       | Date       | Task                                               |
| --------- | ---------- | -------------------------------------------------- |
| Day 1     | Sep 15     | Order System: Cart → Checkout flow                 |
| Day 2     | Sep 16     | Order System: Create Order logic                   |
| Day 3     | Sep 17     | Order System: Save order to database               |
| Day 4     | Sep 18     | Inventory Logic: Stock decreases on order          |
| Day 5     | Sep 19     | PayHere: Sandbox setup + basic integration         |
| Day 6     | Sep 20     | PayHere: Callback handling + order status          |
| **Day 7** | **Sep 21** | **🟡 Buffer — PayHere webhook/callback debugging** |
| Day 8     | Sep 22     | End-to-end order testing                           |

🟡 **Watch this week:** PayHere sandbox + webhook setup is the most likely place to lose time.

## WEEK 8 (Sep 23 – Sep 29): AI Customer Assistant

| Day   | Date   | Task                          |
| ----- | ------ | ----------------------------- |
| Day 1 | Sep 23 | Prepare product info dataset  |
| Day 2 | Sep 24 | Integrate OpenAI API          |
| Day 3 | Sep 25 | Build chatbot UI              |
| Day 4 | Sep 26 | Connect chatbot UI to backend |
| Day 5 | Sep 27 | Prompt design & refinement    |
| Day 6 | Sep 28 | Test AI responses             |
| Day 7 | Sep 29 | Polish chatbot UX             |

## WEEK 9 (Sep 30 – Oct 7): n8n Automation & Notifications ⚠️ +1 day buffer

| Day       | Date      | Task                                        |
| --------- | --------- | ------------------------------------------- |
| Day 1     | Sep 30    | Setup n8n on VPS (Docker)                   |
| **Day 2** | **Oct 1** | **🟡 Buffer — VPS/DNS/SSL troubleshooting** |
| Day 3     | Oct 2     | n8n workflow basics + webhook node          |
| Day 4     | Oct 3     | Order automation: Trigger setup             |
| Day 5     | Oct 4     | Order automation: Email/WhatsApp send       |
| Day 6     | Oct 5     | Inventory alert automation                  |
| Day 7     | Oct 6     | Test automation flows                       |
| Day 8     | Oct 7     | Fix automation bugs                         |

🟡 **Watch this week:** First-time VPS + Docker + n8n setup.

## WEEK 10 (Oct 8 – Oct 14): Testing & QA

| Day   | Date   | Task                                |
| ----- | ------ | ----------------------------------- |
| Day 1 | Oct 8  | Test plan document                  |
| Day 2 | Oct 9  | Functional testing: Login           |
| Day 3 | Oct 10 | Functional testing: Products + Cart |
| Day 4 | Oct 11 | Functional testing: Orders          |
| Day 5 | Oct 12 | Security testing                    |
| Day 6 | Oct 13 | Fix bugs (batch 1)                  |
| Day 7 | Oct 14 | Fix bugs (batch 2) + retest         |

## WEEK 11 (Oct 15 – Oct 22): Deployment & DevOps ⚠️ +1 day buffer

| Day       | Date       | Task                                         |
| --------- | ---------- | -------------------------------------------- |
| Day 1     | Oct 15     | Production prep (env vars, secrets)          |
| Day 2     | Oct 16     | Deploy frontend (Cloudflare Pages)           |
| Day 3     | Oct 17     | Deploy database (Neon managed)               |
| Day 4     | Oct 18     | GitHub Actions setup                         |
| **Day 5** | **Oct 19** | **🟡 Buffer — CI/CD pipeline debugging**     |
| Day 6     | Oct 20     | Automated deployment on push                 |
| Day 7     | Oct 21-22  | Performance testing + final production check |

## WEEK 12 (Oct 23 – Oct 30): Documentation, Presentation & Launch 🎉

| Day       | Date       | Task                              |
| --------- | ---------- | --------------------------------- |
| Day 1     | Oct 23     | Docs: Introduction + Architecture |
| Day 2     | Oct 24     | Docs: Database + Features         |
| Day 3     | Oct 25     | Docs: Testing + Deployment        |
| Day 4     | Oct 26     | Presentation slides               |
| Day 5     | Oct 27     | Live demo prep                    |
| Day 6     | Oct 28     | Polish GitHub repo                |
| Day 7     | Oct 29     | Final review                      |
| **Day 8** | **Oct 30** | **✅ DEORA LAUNCH**               |

---

## 📋 Updated Summary

| Milestone                     | Date                         |
| ----------------------------- | ---------------------------- |
| Project start (Week 1)        | Aug 1, 2026                  |
| Current position              | Aug 22, 2026 — Week 3, Day 4 |
| Backend + Frontend complete   | ~Sep 22, 2026                |
| AI + Automation complete      | ~Oct 7, 2026                 |
| Testing + Deployment complete | ~Oct 22, 2026                |
| **Launch**                    | **~Oct 30, 2026**            |

**Buffer days included:** Week 7 (PayHere), Week 9 (VPS/n8n), Week 11 (CI/CD) — same risk areas as before, just recalculated against real dates.

## 📌 Notes

- This replaces the earlier "Sep 1 start" version — that one incorrectly assumed Week 3 started in September instead of continuing from your actual Aug 1 start.
- Small day slippage (like Week 3 Day 4 taking 2 days) is normal — it doesn't require recalculating the whole plan each time. Only recalculate if a full week's worth of delay stacks up.
- Launch moved **earlier** than the original plan (Oct 30 vs Nov 12-13) simply because your actual start date (Aug 1) was earlier than the assumed one (Sep 1) — the project length itself (12 weeks + buffers) hasn't changed.
