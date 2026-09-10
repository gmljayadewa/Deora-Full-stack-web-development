import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        if (!email || !password) {
          return null
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        }
      },
    }),
  ],
})