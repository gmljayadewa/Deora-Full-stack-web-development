import {NextResponse} from "next/server";
import {NextRequest} from "next/server";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";


const JWT_SECRET = process.env.JWT_SECRET!;


export async function POST(request: NextRequest) {
  try{
    //step 1: get the token from cookie
    const token = request.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json({message: "Unauthorized - please log in"},{status:401});
     }

     //step 2: verify the token and get the user id
     let userId:string;
     try{
      //check the id is valid and get the user id from the token
      const decoded = jwt.verify(token, JWT_SECRET) as { id:string; role:string };
      userId = decoded.id;
    } catch{
      return NextResponse.json({message: "Invalid or expired token"},{status:401});  
    }

    //step 3: get the productId and quantity from the request body.
    const{ productId, quantity } = await request.json();
    if(!productId || !quantity || quantity < 1){
      return NextResponse.json({message:"productId and a valid quantity are required"},{status:400});
    }
  

  //step 4: upsert cart for this user
  const cart = await prisma.cart.upsert({
    where:{userId},
    update:{},
    create:{userId},

    });

    // step 5: upsert cart item (already in cart? increase qty : add new)
    const cartItem =  await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });
  
    return NextResponse.json(cartItem,{status:201});

  }catch(error){
    console.error("POST/api/cart error:",error);
    return NextResponse.json({message:"Failed to add item to cart"},{status:500});
  }
}