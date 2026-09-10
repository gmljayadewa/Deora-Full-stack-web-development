import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs" 

export async function POST(request : Request) {
    try{

        //recived the request data from the client
        const { email, password } = await request.json();
    
        // validation for the rewuest data
        if(!email || !password) {
            return NextResponse.json(
                { message : "email and password are required!"},
                {status : 400}
            );
        }
      
        // find the user in the databade by email
        const existingUser = await prisma.user.findUnique(
            {
                where: {email},
            }
        );

        // if user does not exist,return an error response
        if(!existingUser) {
            return NextResponse.json(
            {message : "Invalid email or password"},
            {status : 401 }
            );
        }
        
        // compare the provide password with the hashed password stored in the database
       const isPasswordValid = await bcrypt.compare(password, existingUser.password);

if(!isPasswordValid) {
    return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
    );
}

         //successful login, return a succesful response  
        return NextResponse.json(
            {message : "login Succesfully"},
            {status :200}
        );
    
    
    }catch(error) {
        //Error Handling
        console.error("login error:",error);
        return NextResponse.json(
            { message : "Internal Server Error"},
            {status:500}

        );
    }
}