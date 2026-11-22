# Deora E-Commerce: Project Map

A simple guide to how the project is organized and how the files connect.
Read this first when you feel lost.

> Items marked **(check)** are files I have not seen directly. Confirm the path in VS Code.

---

## 1. Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth (`auth.ts`) and a custom JWT check (`proxy.ts`) |
| AI assistant | OpenAI-compatible API (`openai` SDK) |
| Payments | PayHere (planned) |

---

## 2. The big picture

```mermaid
flowchart LR
  subgraph Browser
    A[Customer]
  end
  subgraph Frontend["Frontend (components)"]
    B[ShopClient / ProductCard / Cart]
    C[Chat widget (check)]
  end
  subgraph Server["Server (Next.js)"]
    D[Server pages: shop/page.tsx]
    E[API routes: /api/products, /api/users, /api/chat]
    F[proxy.ts: admin check]
  end
  subgraph Data["Data layer"]
    G[lib/product-queries.ts]
    H[(PostgreSQL via Prisma)]
  end
  subgraph AI["AI assistant"]
    I[lib/ai/prompt.ts]
    J[data/*.json + chatbot-rules.md]
    K[LLM API]
  end

  A --> B
  A --> C
  B --> D
  D --> G --> H
  B --> E
  E --> F
  E --> H
  C --> E
  E --> I --> J
  I --> K
```

Think of it like a restaurant:

| Restaurant | Project | Where |
|---|---|---|
| Pantry | Database | `prisma/schema.prisma` |
| Pantry keeper | Prisma queries | `src/lib/prisma.ts`, `src/lib/product-queries.ts` |
| Kitchen | Server pages and API routes | `src/app/**` |
| Waiter and menu | React components | `src/components/**` |
| Customer | Browser | |

---

## 3. Folder map

```
deora-ecommerce/
├── prisma/
│   ├── schema.prisma          # Database design (User, Product, Order, Payment...)
│   └── migrations/
├── src/
│   ├── app/                   # PAGES and API ROUTES
│   │   ├── page.tsx           # Home page
│   │   ├── shop/
│   │   │   ├── page.tsx       # SERVER: reads products from DB
│   │   │   └── ShopClient.tsx # BROWSER: search, filters, grid
│   │   ├── products/[id]/
│   │   │   └── page.tsx       # SERVER: product detail page
│   │   ├── about/ ...         # other pages
│   │   └── api/               # BACKEND endpoints (check exact routes)
│   │       ├── products/      # GET / POST / PUT / DELETE
│   │       ├── users/         # register, login, users list
│   │       └── chat/          # AI assistant endpoint
│   ├── components/            # UI pieces
│   │   ├── ProductCard.tsx
│   │   ├── FeaturedProducts.tsx        # SERVER: reads DB
│   │   ├── FeaturedProductsClient.tsx  # BROWSER: scroll row
│   │   ├── ProductImageGallery.tsx
│   │   ├── ProductQuantitySelector.tsx
│   │   ├── ShopByCategory.tsx
│   │   └── Navbar, Footer, PromoBanner, Newsletter, WhyChooseDeora
│   ├── context/
│   │   └── CartContext.tsx    # Cart state in the browser
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client (check)
│   │   ├── product-queries.ts # DB reads for the shop
│   │   ├── products.ts        # Product TYPE (and an old static list, see Known issues)
│   │   └── ai/prompt.ts       # Builds the AI system prompt
│   ├── services/
│   │   └── inventory.service.ts
│   ├── auth.ts                # NextAuth setup
│   └── proxy.ts               # Protects admin API routes (JWT + ADMIN role)
├── public/images/products/    # capsules/ tea/ spices/ nutrition/
├── data/
│   ├── products-data.ts       # SOURCE OF TRUTH for the 27 products
│   ├── products-for-ai.json   # GENERATED for the chatbot
│   ├── faq.json
│   ├── store-info.json
│   └── chatbot-rules.md
├── scripts/                   # One-time and helper scripts (see section 6)
└── docs/                      # Documentation, AI test results
```

Auto-generated (do not edit): `.next/`, `node_modules/`, `src/generated/`.

---

## 4. How the files connect (request flows)

### 4.1 Shop page (`/shop`)

```
Browser opens /shop
  → src/app/shop/page.tsx          (server) asks for data
  → src/lib/product-queries.ts     getProducts(), getCategoryNames()
  → Prisma → PostgreSQL            only products where isActive = true
  → back to page.tsx               passes products + categories as props
  → src/app/shop/ShopClient.tsx    (browser) search / category / price filters
  → src/components/ProductCard.tsx one card per product
```

Why two files? A page that reads the DB must be a **server** file.
A page with search boxes and buttons must be a **client** file.
So `page.tsx` fetches, `ShopClient.tsx` displays.

### 4.2 Product detail (`/products/[id]`)

```
products/[id]/page.tsx (server)
  → getProductByIdFromDb(id) and getRelatedProducts(id)
  → ProductImageGallery, ProductQuantitySelector (browser) and ProductCard
```

### 4.3 Home page featured row

```
FeaturedProducts.tsx (server) → getProducts() → FeaturedProductsClient.tsx (browser)
```

### 4.4 Cart

```
ProductCard "Add to Cart" → CartContext.addItem() → cart lives in the browser
```

Checkout, orders and payments (PayHere) are the next step. Tables already exist in `schema.prisma`: `Order`, `OrderItem`, `Payment`.

### 4.5 Admin changes (planned)

```
Admin dashboard (to build)
  → POST / PUT / DELETE /api/products
  → proxy.ts checks the token and ADMIN role
  → Prisma writes to the DB
  → shop pages show the change right away (they use force-dynamic)
```

### 4.6 AI assistant

```
Customer types a question in the chat widget (check)
  → POST /api/chat                          (check path: src/app/api/chat/route.ts)
  → src/lib/ai/prompt.ts  buildSystemPrompt()
       reads: data/products-for-ai.json   (products, price, in/out of stock)
              data/faq.json               (common questions)
              data/store-info.json        (delivery, payment, contact)
              data/chatbot-rules.md       (what the bot may and may not say)
  → LLM API (env: AI_API_KEY, AI_BASE_URL, AI_MODEL)
  → reply goes back to the chat widget
```

Important: the chatbot only knows what is in `products-for-ai.json`.
After any product, price or stock change, run:

```
npx tsx scripts/export-products.ts
```

Test tools: `scripts/test-chat.ts` (saves answers to `docs/ai-test-results.md`) and `scripts/ping-ai.ts` (checks API speed).

---

## 5. Where product data comes from

```
data/products-data.ts          (27 products: names, images, descriptions)
        │  npx tsx scripts/seed-products.ts
        ▼
   PostgreSQL  ◄── prices and stock are set in the admin dashboard
        │             (or scripts/set-prices.ts, scripts/seed-inventory.ts)
        ├──► Shop, detail page, home page   (live, from the DB)
        └──► npx tsx scripts/export-products.ts → data/products-for-ai.json → chatbot
```

Rule: **the database is the truth for price, stock and isActive.**
`seed-products.ts` never overwrites price or isActive for existing products.

---

## 6. Scripts

| Script | When to run |
|---|---|
| `export-products.ts` | **Every time** products, prices or stock change (updates the chatbot) |
| `check-products.ts` | Print a table of all products (price, active, stock) |
| `check-images.ts` | Find image paths in code that are missing from Git |
| `test-chat.ts` | Test the AI assistant with sample questions |
| `ping-ai.ts` | Check how fast the AI API responds |
| `seed-products.ts` | Add or update the 27 products from `products-data.ts` |
| `cleanup-products.ts` | Remove products that are not in `products-data.ts` |
| `set-prices.ts` | Done once. Prices are now managed in the DB |
| `seed-inventory.ts` | Done once (sets test stock) |
| `rename-images.ts` | Done once (kebab-case file names) |

Run any script with: `npx tsx scripts/<name>.ts`

---

## 7. Where to look when something breaks

| Problem | Look here |
|---|---|
| Wrong text, layout or button | `src/components/` |
| Wrong product data on a page | `src/lib/product-queries.ts` |
| A new database field is needed | `prisma/schema.prisma`, then `npx prisma migrate dev` |
| Image not showing | `public/images/products/...` and the `image` path in the DB |
| 401 or 403 on an API call | `src/proxy.ts`, `src/auth.ts` |
| Chatbot gives wrong or old answers | `data/products-for-ai.json` (re-export), then `chatbot-rules.md` |
| Product missing on the shop | `isActive` is false or price is 0 (run `check-products.ts`) |

---

## 8. Known issues and TODO

1. **Old static list**: `src/lib/products.ts` still contains an old hard-coded `PRODUCTS` list.
   Nothing should use it now. After checking with a search for `PRODUCTS`, delete the list and keep only the `Product` type.
2. **Chatbot data was stale**: `products-for-ai.json` had 40 old products. Re-run `export-products.ts`.
3. **Placeholders in `store-info.json`**: phone, email and delivery fee are fake. Replace before launch.
   Also `sells` mentions cookies and pickles, which are not in the current 27 products.
4. **Two login systems**: `auth.ts` uses NextAuth, but `proxy.ts` checks a custom `token` cookie (JWT) and the `ADMIN` role.
   They are not connected. Decide on one before building the admin dashboard.
   `proxy.ts` also protects every `/api/users/*` route, so check that login and register are not blocked.
5. **Categories**: `ShopByCategory.tsx` may still use old names (Wellness, Herbal Tea). The DB uses Capsules, Tea, Spices, Nutrition.
6. **Docs**: `API_DOCUMENTATION.md` still says 42 products. Update to 27.
7. **Ingredients and usage** are still `TODO` for all products. The chatbot cannot answer "how do I use it?" until they are filled in.

---

## 9. Next steps (from the 12-week plan)

1. Fix the login system (known issue 4).
2. Admin dashboard: product list, add, edit (price, stock, image), delete.
3. Checkout, orders and PayHere payment.
4. n8n automation (order email or WhatsApp).
5. Tests, deployment (Vercel), final documentation.
