# Deora Project — Revised Day-by-Day Plan (with Buffer)

**Target Launch: Nov 12-13, 2026** 🚀 (Original Nov 9 + 3-4 day buffer)
**Support Model:** AI-assisted (Claude helps with code, debugging, docs, concepts). "Stuck checkpoints" added to risky weeks.

---

## PHASE 2 — FOUNDATION

### WEEK 3 (Sep 1 – Sep 7): Environment Setup & Authentication
| Day | Date | Task |
|---|---|---|
| Day 1 | Sep 1 | Setup GitHub, Next.js, TypeScript, Tailwind |
| Day 2 | Sep 2 | Project structure (`app/`, `components/`, `services/`, `database/`, `utils/`) |
| Day 3 | Sep 3 | PostgreSQL + Prisma + first migration |
| Day 4 | Sep 4 | Auth Part 1: User model, bcrypt, Register API |
| Day 5 | Sep 5 | Auth Part 2: Login API, NextAuth.js session |
| Day 6 | Sep 6 | Auth Part 3: Logout, validation, error handling |
| Day 7 | Sep 7 | Test auth end-to-end |

🟢 **Checkpoint:** Low risk. Standard pattern, well-documented. No buffer needed.

---

## PHASE 3 — FRONTEND DEVELOPMENT

### WEEK 4 (Sep 8 – Sep 14): Website UI Development
| Day | Date | Task |
|---|---|---|
| Day 1 | Sep 8 | Navbar, Footer, Layout |
| Day 2 | Sep 9 | Homepage: Hero section |
| Day 3 | Sep 10 | Homepage: Categories + Featured products |
| Day 4 | Sep 11 | Product cards |
| Day 5 | Sep 12 | Search + Filter |
| Day 6 | Sep 13 | Product Details Page (`/products/[id]`) |
| Day 7 | Sep 14 | UI testing (mobile/tablet/desktop) |

🟢 **Checkpoint:** Low risk.

### WEEK 5 (Sep 15 – Sep 21): Cart & Checkout Frontend
| Day | Date | Task |
|---|---|---|
| Day 1 | Sep 15 | Cart: Add product |
| Day 2 | Sep 16 | Cart: Remove product |
| Day 3 | Sep 17 | Cart: Update quantity + total |
| Day 4 | Sep 18 | Checkout: Customer details form |
| Day 5 | Sep 19 | Checkout: Address + Order summary |
| Day 6 | Sep 20 | Responsive testing |
| Day 7 | Sep 21 | Review frontend, fix bugs |

🟢 **Checkpoint:** Low risk.

---

## PHASE 4 — BACKEND DEVELOPMENT

### WEEK 6 (Sep 22 – Sep 28): Backend API Development
| Day | Date | Task |
|---|---|---|
| Day 1 | Sep 22 | API folder structure |
| Day 2 | Sep 23 | Product API: Get products |
| Day 3 | Sep 24 | Product API: Add product |
| Day 4 | Sep 25 | Product API: Update/Delete |
| Day 5 | Sep 26 | User APIs |
| Day 6 | Sep 27 | Test all APIs (Postman/Thunder Client) |
| Day 7 | Sep 28 | API documentation |

🟢 **Checkpoint:** Low risk.

### WEEK 7 (Sep 29 – Oct 6): Order, Inventory & Payment ⚠️ +1 DAY BUFFER
| Day | Date | Task |
|---|---|---|
| Day 1 | Sep 29 | Order System: Cart → Checkout data flow |
| Day 2 | Sep 30 | Order System: Create Order logic |
| Day 3 | Oct 1 | Order System: Save order to database |
| Day 4 | Oct 2 | Inventory Logic: Stock decreases on order |
| Day 5 | Oct 3 | PayHere: Sandbox account setup + basic integration |
| Day 6 | Oct 4 | PayHere: Callback handling + order status update |
| **Day 7** | **Oct 5** | **🟡 Buffer day — PayHere debugging (webhook signature, callback URL issues)** |
| Day 8 | Oct 6 | End-to-end order testing (cart → pay → order saved) |

🟡 **Checkpoint — HIGH RISK:** PayHere sandbox account approval can take time; webhook/callback debugging is the #1 place people get stuck. **If stuck by Day 6, share the error/logs immediately — don't wait till Day 7.**

---

## PHASE 5 — AI & AUTOMATION

### WEEK 8 (Oct 7 – Oct 13): AI Customer Assistant
| Day | Date | Task |
|---|---|---|
| Day 1 | Oct 7 | Prepare product info dataset |
| Day 2 | Oct 8 | Integrate OpenAI API (basic connection) |
| Day 3 | Oct 9 | Build chatbot UI component |
| Day 4 | Oct 10 | Connect chatbot UI to backend route |
| Day 5 | Oct 11 | Prompt design & refinement |
| Day 6 | Oct 12 | Test AI responses (accuracy, edge cases) |
| Day 7 | Oct 13 | Polish chatbot UX |

🟢 **Checkpoint:** Medium risk but AI-assisted prompt engineering speeds this up a lot — no extra buffer needed.

### WEEK 9 (Oct 14 – Oct 21): n8n Automation & Notifications ⚠️ +1 DAY BUFFER
| Day | Date | Task |
|---|---|---|
| Day 1 | Oct 14 | Setup n8n on VPS (Docker) |
| **Day 2** | **Oct 15** | **🟡 Buffer day — VPS/DNS/SSL/reverse proxy troubleshooting** |
| Day 3 | Oct 16 | n8n workflow basics + webhook node |
| Day 4 | Oct 17 | Order automation: New Order → n8n Trigger |
| Day 5 | Oct 18 | Order automation: Generate message → Email/WhatsApp |
| Day 6 | Oct 19 | Inventory alert automation |
| Day 7 | Oct 20 | Test automation flows |
| Day 8 | Oct 21 | Fix automation bugs |

🟡 **Checkpoint — HIGH RISK:** First-time VPS + Docker + n8n setup is where most delays happen (server access, ports, domain, SSL). **If VPS setup isn't working after ~3 hours, stop and share your terminal output/error.**

---

## PHASE 6 — TESTING, DEPLOYMENT & DOCUMENTATION

### WEEK 10 (Oct 22 – Oct 28): Testing & QA
| Day | Date | Task |
|---|---|---|
| Day 1 | Oct 22 | Test plan document |
| Day 2 | Oct 23 | Functional testing: Login |
| Day 3 | Oct 24 | Functional testing: Products + Cart |
| Day 4 | Oct 25 | Functional testing: Orders |
| Day 5 | Oct 26 | Security testing: Auth + Validation |
| Day 6 | Oct 27 | Fix bugs (batch 1) |
| Day 7 | Oct 28 | Fix bugs (batch 2) + retest |

🟢 **Checkpoint:** Low risk — this week doubles as a natural buffer/catch-up week too.

### WEEK 11 (Oct 29 – Nov 4): Deployment & DevOps ⚠️ +1 DAY BUFFER
| Day | Date | Task |
|---|---|---|
| Day 1 | Oct 29 | Production prep (env vars, secrets, build check) |
| Day 2 | Oct 30 | Deploy frontend (Cloudflare Pages) |
| Day 3 | Oct 31 | Deploy database (Neon/Supabase managed) |
| Day 4 | Nov 1 | GitHub Actions setup |
| **Day 5** | **Nov 2** | **🟡 Buffer day — CI/CD pipeline debugging** |
| Day 6 | Nov 3 | Automated deployment on push |
| Day 7 | Nov 4 | Performance testing + final production check |

🟡 **Checkpoint — MEDIUM RISK:** CI/CD pipelines often fail on first few runs (env var mismatches, build errors that only show in production).

### WEEK 12 (Nov 5 – Nov 12/13): Documentation, Presentation & Portfolio 🎉
| Day | Date | Task |
|---|---|---|
| Day 1 | Nov 5 | Docs: Introduction + Architecture |
| Day 2 | Nov 6 | Docs: Database + Features |
| Day 3 | Nov 7 | Docs: Testing + Deployment |
| Day 4 | Nov 8 | Presentation slides |
| Day 5 | Nov 9 | Live demo prep (Order → DB → n8n → Notification) |
| Day 6 | Nov 10 | Polish GitHub repo (README, screenshots) |
| Day 7 | Nov 11 | Final review |
| **Day 8** | **Nov 12-13** | **✅ DEORA LAUNCH** |

---

## 📋 Buffer Summary
| Week | Reason | Extra Days |
|---|---|---|
| Week 7 | PayHere webhook/callback debugging | +1 |
| Week 9 | VPS/Docker/n8n first-time setup | +1 |
| Week 11 | CI/CD pipeline debugging | +1 |
| **Total** | | **+3 days** (Nov 9 → Nov 12-13) |

## 🔔 "Stuck" Rule (applies to 🟡 weeks especially)
If you're blocked on something for **more than 2-3 hours** with no progress:
1. Stop trying random fixes
2. Copy the exact error message / logs
3. Bring it here — share what you tried already
4. We debug together instead of you losing a full day guessing

## 📌 Notes
- 🟢 weeks = standard, low-risk, AI help mainly speeds up code-writing.
- 🟡 weeks = real-world integration risk (external services, servers) — these are the ones to watch.
- If a 🟡 buffer day isn't needed, it becomes free catch-up time — never wasted.
