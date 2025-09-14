import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const runtime = "nodejs"

const config: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    })
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
    newUser: "/dashboard",
  }
}

const handler = NextAuth(config)
export { handler as GET, handler as POST }