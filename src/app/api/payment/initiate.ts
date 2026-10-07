import {NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { generatePayHereHash } from "@/lib/payhere";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request : NextRequest){
  try{
    let userId: string;

    //Reading and Checking the Token
    const token = request.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json( {message: "Unauthorized-Please log in"},{ status: 401 });
    }

    //verifying the Token
    try{
      const decoded = jwt.verify(token, JWT_SECRET) as {id: string; role:string };
      userId = decoded.id;
    }catch{
      return NextResponse.json( {message: "Invalid or expired token"},{status: 401});
      
    }

    const { shippingAddress } = await request.json();
    if(!shippingAddress){
      return NextResponse.json( {message: "Shipping Address is required"},{status: 400});
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }
  
    //calculating the total amount of the cart
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
 
    //creating the order in the database
    const order = await prisma.order.create({
      data:{
        userId,
        totalAmount,
        shippingAddress,
        status:"PENDING",
        items:{
          create: cart.items.map((item)=>({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,

          })),
        },
        payment:{
          create:{
            amount: totalAmount, method: "CARD", status:"PENDING"},
          },
        },
      });

      //Genertating the Hash and Responding
      const merchantId = process.env.PAYHERE_MERCHENT_ID!;
      const merchantSecret = process.env.PAYHERE_MERCHENT_SECRET!;
      const currency = "LKR";

      const hash = generatePayHereHash(merchantId, order.id, totalAmount,currency,merchantSecret);

      return NextResponse.json({
        merchantId,
        orderId: order.id,
        amount: totalAmount.toFixed(2),
        currency,
        hash,
      });

    } catch (error){
      console.error("POST/api/payment/initiate error:", error);
      return NextResponse.json({ message: "Failed to initiate payment" }, { status: 500 });
    }
}



