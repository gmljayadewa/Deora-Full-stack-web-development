-- Add idempotency fields to orders
ALTER TABLE "orders" ADD COLUMN "idempotencyHash" VARCHAR(64), ADD COLUMN "idempotencyKey" VARCHAR(100);

-- Prevent duplicate checkout attempts per user
CREATE UNIQUE INDEX "orders_userId_idempotencyKey_key" ON "orders"("userId", "idempotencyKey");
