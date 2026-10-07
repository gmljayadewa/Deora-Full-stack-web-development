import { Prisma } from "@/generated/prisma"; // ⚠️ path එක ඔයාගේ custom generator output එකට match කරන්ඩ

// "why accept 'tx' as a parameter?" — මේ function එක $transaction block එකක්
// ඇතුළේ call වෙන්ඩ ඕන (order creation එකේම atomic transaction එකේම කොටසක්
// වෙන්ඩ ඕන). Prisma client (`prisma`) එකම use කළොත්, transaction එකෙන්
// පිටින් run වෙනවා — atomicity guarantee එක නැති වෙනවා.

export async function decrementStock(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  productName: string
) {
  const result = await tx.inventory.updateMany({
    where: {
      productId,
      quantity: { gte: quantity },
    },
    data: {
      quantity: { decrement: quantity },
    },
  });

  if (result.count === 0) {
    throw new Error(`Insufficient stock for ${productName}`);
  }
}