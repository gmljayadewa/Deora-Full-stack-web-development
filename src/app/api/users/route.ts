import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


//GET/api/users - GET all users list(admin only)
export async function GET() {
try{
    //why select, not include,because we want to select specific fields from the user table,not include related tables
    //relation categry collection is not included in the user table,so we use select to get specific fields from the user table
   //opposite reason - exclude password feild from the user table,so return the user data without the password field

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name:true,
            email: true,
            phone:true,
            address:true,
            role: true,
            createdAt: true,
            updatedAt:true,
            //password: false-explict "fails" no need to put for password feild because selected field are only returned ,and password exclude automatically

        },
        orderBy:{createdAt:"desc"},
    });

    return NextResponse.json(users,{status:200});
}
catch(error){
    console.error("GET/api/users error:",error);
    return NextResponse.json(
        { message:"failed to fetch users"},
        {status:500}
    );
}


}