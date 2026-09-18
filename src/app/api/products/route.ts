//make the API response to JSON format
import { NextResponse } from "next/server";
//call the database from prisma client
import {prisma} from "@/lib/prisma";


//  GET function to fetch all products from the database
export async function GET(){
      
    try{ 
      //Database call
      const products = await prisma.product.findMany();

      //get products
   return NextResponse.json(products, { status: 200 });

        } catch (error) {
        // error response
    return NextResponse.json(
       {' message': 'Failed to fetch products',} ,
       {'status': 500},
    );
  }}


export async function POST(request:Request){
 try{
   //Step 1: Customer request body
   const body = await request.json();
   const { name, description, price, categoryId, image, isActive } = body;

   //Step 2: Create a new product in the database
   const product = { name, description, price, categoryId, image, isActive };
  
   //Step 3: validation
   if(!name || price === undefined || !categoryId){
     return NextResponse.json(
        {'message': "name, price and categoryId are required "},
        {'status': 400}
     );
   }

    //Step 4: Create the product in the database
    const newProduct = await prisma.product.create({
     data: product
   });

   //Step 5: Return the newly created product as a response
     return NextResponse.json(newProduct, { status: 201 });
 
} catch (error) {
    //error response
    console.error("POST/api/products error:",error);
     return NextResponse.json(
        { message:'Failed to create product'},
        {status: 500}
    );
 } 
}

