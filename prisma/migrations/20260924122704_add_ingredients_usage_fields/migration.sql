/*
  Warnings:

  - Added the required column `ingredients` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usage` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
   ALTER TABLE "products" ADD COLUMN "ingredients" TEXT NOT NULL DEFAULT '',
   ADD COLUMN "usage" TEXT NOT NULL DEFAULT '';