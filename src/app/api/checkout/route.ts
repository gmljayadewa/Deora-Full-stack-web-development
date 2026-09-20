import { NextResponse }  from "next/server";
import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request:NextRequest){
try{
  //step 1:get the token from the cookies(add to cart logic)
   const token = request.cookies.get("token")?.value;
   if(!token){
    return NextResponse.json({message:"Unauthorized-please log in"},{status:401});
   }

   //step 2: verify the token and get the user id(Add to cart logic)
   let userId : string;
   try{
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string};
    userId = decoded.id;
}catch{
    return NextResponse.json({ message: "Invalid or expired token"},{ status: 401});
}

//step 3: fetch the cart for this user with the cart items and product details (checkout logic)
const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
        items: {
            include:{
                product:true , //cart->cartItem->product(2 levels deep)
            },
        },
    },
});

//step 4a: empty cart check
if (!cart || cart.items.length === 0) {
    return NextResponse.json({ message: "Cart is empty"},{ status: 400});
    }

//step 4b: Calculate the subtotal and total price
const itemWithSubtotal = cart.items.map((item) => {
    const unitPrice = Number(item.product.price); 
    const subtotal = unitPrice * item.quantity;

    return {
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
    };
});

//step 4c: Calculate the grand total
const total = itemWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);


//step 5: return the items + total price to the client 
return NextResponse.json(
    {
        items : itemWithSubtotal,
        total,
    },
    {status : 200}
);


}catch (error){
 console.error("GET/api/checkout error:",error);
 return NextResponse.json({ message: "Failed to load checkout"},{ status: 500});
}

}