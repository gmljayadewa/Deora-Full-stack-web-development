# Deora E-Commerce - API Documentation

Base URL (development): `http://localhost:3000/api`
Base URL (production): `https://your-domain.vercel.app/api`

All request/response bodies are JSON. Authenticated routes require a valid session (NextAuth.js).

---

## 1. Authentication

### Register Customer
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Kasun Perera",
  "email": "kasun@example.com",
  "password": "SecurePass123"
}
```
**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": "uuid", "name": "Kasun Perera", "email": "kasun@example.com" }
}
```
**Errors:** 400 (validation failed), 409 (email already exists)

---

### Login
```
POST /api/auth/login
```
Handled via NextAuth.js `credentials` provider (`/api/auth/[...nextauth]`).

**Body:**
```json
{ "email": "kasun@example.com", "password": "SecurePass123" }
```
**Response (200):** session cookie set + user object
**Errors:** 401 (invalid credentials)

---

### Logout
```
POST /api/auth/signout
```
Handled by NextAuth.js. Clears session.

---

## 2. Products

### Get All Products
```
GET /api/products
```
**Query params (optional):**
- `category` – filter by category slug
- `search` – keyword search by product name

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Moringa Capsules",
    "price": 1200.00,
    "category": "Herbal Capsules",
    "stock": 25,
    "image": "url",
    "status": "active"
  }
]
```

### Get Single Product
```
GET /api/products/[id]
```
**Response (200):** full product object (description, ingredients, benefits, stock, price)
**Errors:** 404 (not found)

### Create Product (Admin only)
```
POST /api/products
```
**Auth:** Admin session required
**Body:**
```json
{
  "name": "Turmeric Capsules",
  "description": "Pure turmeric root extract",
  "price": 1100.00,
  "categoryId": "uuid",
  "sku": "DEO-TUR-30",
  "stock": 30,
  "image": "url"
}
```
**Response (201):** created product object
**Errors:** 401 (not authenticated), 403 (not admin), 400 (validation)

### Update Product (Admin only)
```
PUT /api/products/[id]
```
**Auth:** Admin session required
**Body:** any subset of product fields
**Response (200):** updated product object

### Delete Product (Admin only - soft delete)
```
DELETE /api/products/[id]
```
**Auth:** Admin session required
**Response (200):** `{ "message": "Product deactivated" }`

---

## 3. Categories

### Get All Categories
```
GET /api/categories
```
**Response (200):**
```json
[
  { "id": "uuid", "name": "Herbal Capsules" },
  { "id": "uuid", "name": "Herbal Tea" }
]
```

---

## 4. Cart

### Get Cart (Logged-in user)
```
GET /api/cart
```
**Auth:** Customer session required
**Response (200):**
```json
{
  "items": [
    { "productId": "uuid", "name": "Moringa Capsules", "price": 1200, "quantity": 1 }
  ],
  "subtotal": 1200
}
```

### Add Item to Cart
```
POST /api/cart
```
**Auth:** Customer session required
**Body:**
```json
{ "productId": "uuid", "quantity": 1 }
```
**Response (200):** updated cart object

### Update Cart Item Quantity
```
PUT /api/cart/[itemId]
```
**Body:** `{ "quantity": 2 }`
**Response (200):** updated cart object

### Remove Cart Item
```
DELETE /api/cart/[itemId]
```
**Response (200):** `{ "message": "Item removed" }`

---

## 5. Orders / Checkout

### Create Order (Checkout)
```
POST /api/orders
```
**Auth:** Customer session required
**Body:**
```json
{
  "shippingDetails": {
    "fullName": "Kasun Perera",
    "phone": "0771234567",
    "email": "kasun@example.com",
    "addressLine1": "123 Main St",
    "city": "Kandy",
    "district": "Kandy",
    "postalCode": "20000"
  },
  "paymentMethod": "COD"
}
```
**Behavior:**
1. Validates cart is not empty
2. Checks stock availability for each item
3. Creates `Order` + `OrderItem` records
4. Decrements product stock
5. If `paymentMethod` is `PayHere`, initiates payment gateway session
6. Triggers n8n webhook for order confirmation (email/WhatsApp)

**Response (201):**
```json
{
  "orderId": "uuid",
  "status": "Pending",
  "total": 3640.00
}
```
**Errors:** 400 (out of stock / empty cart), 401 (not authenticated)

### Get Customer Order History
```
GET /api/orders
```
**Auth:** Customer session required
**Response (200):** array of the logged-in customer's orders

### Get Single Order
```
GET /api/orders/[id]
```
**Auth:** Customer (own order) or Admin
**Response (200):** full order detail with items

### Update Order Status (Admin only)
```
PUT /api/orders/[id]
```
**Auth:** Admin session required
**Body:**
```json
{ "status": "Processing" }
```
**Allowed statuses:** `Pending`, `Paid`, `Processing`, `Shipped`, `Delivered`, `Cancelled`
**Response (200):** updated order object

---

## 6. Inventory (Admin)

### Get Low Stock Products
```
GET /api/inventory/low-stock
```
**Auth:** Admin session required
**Response (200):** products where `stock <= 10`

### Adjust Stock
```
PUT /api/inventory/[productId]
```
**Auth:** Admin session required
**Body:** `{ "stock": 50 }`
**Response (200):** updated product stock

---

## 7. Payment (PayHere - Sandbox)

### Initiate Payment
```
POST /api/payment/initiate
```
**Body:** `{ "orderId": "uuid" }`
**Response (200):** PayHere sandbox checkout URL / payment session data

### Payment Webhook (PayHere callback)
```
POST /api/payment/webhook
```
Called by PayHere after payment attempt. Updates order `status` and `Payment` record based on success/failure.

---

## 8. AI Chatbot

### Send Message to AI Assistant
```
POST /api/chatbot
```
**Body:**
```json
{ "message": "What are the benefits of Moringa Capsules?" }
```
**Response (200):**
```json
{ "reply": "Moringa Capsules support immunity, energy, and overall well-being..." }
```
**Notes:** Uses OpenAI API with product knowledge base as context (per AI-002, AI-006 in SRS - no invented prices/details).

---

## 9. Admin Dashboard

### Get Dashboard Summary
```
GET /api/admin/dashboard
```
**Auth:** Admin session required
**Response (200):**
```json
{
  "totalSales": 245800,
  "totalOrders": 128,
  "totalCustomers": 246,
  "totalProducts": 42
}
```

---

## Authentication & Authorization Summary

| Route Pattern | Access |
|---|---|
| `/api/auth/*` | Public |
| `/api/products` (GET) | Public |
| `/api/products` (POST/PUT/DELETE) | Admin only |
| `/api/cart/*` | Logged-in Customer |
| `/api/orders` (POST/GET own) | Logged-in Customer |
| `/api/orders/[id]` (PUT status) | Admin only |
| `/api/inventory/*` | Admin only |
| `/api/admin/*` | Admin only |
| `/api/chatbot` | Public (or logged-in, TBD) |

---

## Status Codes Reference

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (logged in, wrong role) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Server Error |

---

*This document reflects the MVP scope defined in the SRS (v1.1). Advanced endpoints (returns/refunds, multi-shipping methods, bulk product import) are deferred to Future Enhancements (SRS Section 5.4).*