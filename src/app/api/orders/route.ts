import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { decrementStock } from "@/services/inventory.service";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest){
  try{
    //step 1-2 token verify (add to cart/checkout logic)
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({message: "Unauthorized - Please log in"},{status: 401});
  } 
 
  let userId : string;
  try{
    const decoded = jwt.verify(token, JWT_SECRET) as {id : string; role : string};
    userId = decoded.id;
  } catch {
    return NextResponse.json({message: "Invalid or expired token"},{ status: 401});
  }

  //step 3: fetch the shippingAddress from the request body(required field from order schema)
  const { shippingAddress } = await request.json();
  if (!shippingAddress) {
    return NextResponse.json({ message: "shippingAddress is required"},{ status: 400});
  }  

  //step 4: fetcht the cart for this user (checkout logic)
  const cart = await prisma.cart.findUnique({
    where : { userId },
    include: {
      items: {
        include: {
          product : true
        },
      },
    },
  });

  if( !cart || cart.items.length === 0){
  return NextResponse.json({ message:"Cart is empty"},{ status :400});
  }

  //step 5: check the prodcut active (can't order inactive product)
  for(const item of cart.items){
    if(!item.product.isActive){
      return NextResponse.json({ message : `${item.product.name} is no longer available`},{ status : 400} );
    }
  }
  
  //step 6 : Price snapshot + total calculate(Day 2 logic)
  const orderItemsData = cart.items.map((item) => ({
    productId : item.productId,
    quantity : item.quantity,
    price : item.product.price, //snapshot - no need to link to product price

  }));

  const totalAmount = cart.items.reduce(
    (sum,item) => sum + Number(item.product.price) * item.quantity, // if stock is enough,calculate the total amount
    0
  );

  //step 7 : Interactive transaction - inventory decrement
  // "why $transaction((tx) => {...})?" — several opratinf (decrement,create,delete
    // ATOMIC විය යුතුයි — එකක් fail උනොත් ඔක්කොම rollback වෙන්ඩ ඕන.
  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      await decrementStock(
        tx as Parameters<typeof decrementStock>[0],
        item.productId,
        item.quantity,
        item.product.name,
      );
    }

    // Create the order and order items in the same transaction.
    const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress,
          totalAmount,
          status: "PENDING",
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      // Clear the cart after its items have been moved to the order.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
  });

    // Step 8: Order confirmation return කරනවා
    return NextResponse.json(order, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/orders error:", error);

    if (error.message?.startsWith("Insufficient stock")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}

