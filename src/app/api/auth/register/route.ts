import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) 
{

    try {

        const body = await request.json();
        const { name, email, password } = body;

        // 2.Validation
        if(!name || !email || !password) {
            return NextResponse.json(
              {message : 'Name, email and password are required!'},
              {status:400}
            );
        }

        //Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format!' },
                { status: 400 }
            );
        }

        //Password strength check
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters!' },
                { status: 400 }
            );
        }

        //Normalize email (avoid duplicate accounts like Test@Gmail.com vs test@gmail.com)
        const normalizedEmail = email.trim().toLowerCase();


//Duplicate check for email
const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail } ,
}) ;

if(existingUser) {
    return NextResponse.json(
        {message : 'User with this email already exists!'},
        {status:400}
    );
}

//Password hashing(for security)
const hashedPassword = await bcrypt.hash(password, 10);

//Prisma query to crete a new user in the database
const newUser = await prisma.user.create({
    data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
    },
});
//sending a response back to the client
return NextResponse.json(
    {
        message: 'User registered successfully!',
        user:{
            id : newUser.id,
            name : newUser.name,
            email : newUser.email,
        },
    },
    {status :201} //201 created status code
);

} catch (error) {
     console.error('Registration error:', error);
     return NextResponse.json(
        { message : 'Something went wrong!'},
        { status:500 }
     );
    } 
}