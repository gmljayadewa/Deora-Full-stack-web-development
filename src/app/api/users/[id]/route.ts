import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

const USER_SAFE_FIELDS={
    id:true,
    name:true,
    email:true,
    phone:true,
    address:true,
    role:true,
    createdAt:true,
    updatedAt:true,
}as const;

export async function GET(
    request:Request,
     //"request" param is required even though GET has no body — Next.js
     // always passes it as the 1st arg to route handlers.

    {params}:{params:Promise<{id:string}>})
      // Gets the dynamic [id] value from the URL.
      // Note: In Next.js 15+, params is a Promise (not a plain object) —
      // must `await` it before reading .id. This changed for performance
      // reasons (lets Next.js start rendering before params are resolved).
    {
      try{
         const {id} = await params;
         const user = await prisma.user.findUnique({
            where: {id},
            select: USER_SAFE_FIELDS
         });
         if(!user){
            return NextResponse.json({error: "User not found"}, {status: 404});
         }
         return NextResponse.json(user,{status:200});

      }  catch(error){
        console.error("GET/api/users/[id] error:",error);
        return NextResponse.json(
          {message:"Failed to fetch user"},
          {status:500}
        );
      }
    }


    //Put function to update user by id
    export async function PUT(
      request:Request,
      {params}:{params:Promise<{id:string}>}
    )
    {
      try{
        const {id} = await params;
        const body = await request.json();
        const{name,phone,address} =body;
        //role: "ADMIN" is not extracted from the request body, so it can not be updated by the user.reason:protected againstmass assignment vulnerability.
        
        //return the id record after updating the user with the new data without password and role fields.
        const updatedUser = await prisma.user.update({
          where: {id},
          data : {name,phone,address},
          select: USER_SAFE_FIELDS,
        });
        return NextResponse.json(updatedUser, {status: 200});
     
    }catch(error:any){
      if(error.code === "P2025"){
        return NextResponse.json({error: "User not found"}, {status: 404});
      }
      console.error("PUT/api/users/[id] error:",error);
      return NextResponse.json(
        {message:"Failed to update user"},
        {status:500}
      );
    }
    }


    //Delete function to delete user by id
    export async function DELETE(
      request:Request,
      {params}:{params:Promise<{id:string}>})
      {
        try{
          const{id} = await params;
      
          //prisma.user.delete() -  Deleted a record from the database and returns the deleted record.
          await prisma.user.delete({
            where:{id}
          });
          return new NextResponse(null,{status:204}); //204 - success,but nothing to return in the response body.
          
        }catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
      }