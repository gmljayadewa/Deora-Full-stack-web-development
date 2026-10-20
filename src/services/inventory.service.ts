import { Prisma } from "@prisma/client";

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`${productName} is out of stock`);
  }
}

// tx = $transaction eke athule thiyena client (order eka ekka atomic wenna)
export async function decrementStock(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  productName: string,
) {
  const result = await tx.inventory.updateMany({
    where: { productId, quantity: { gte: quantity } },
    data: { quantity: { decrement: quantity } },
  });

  // Inventory row eka nathi unath, stock madi unath: dekatama mehema
  if (result.count === 0) throw new OutOfStockError(productName);
}

export async function restoreStock(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
) {
  for (const item of items) {
    await tx.inventory.updateMany({
      where: { productId: item.productId },
      data: { quantity: { increment: item.quantity } },
    });
  }
}
