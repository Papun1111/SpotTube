// app/api/auth/[...nextauth]/route.ts

import { prismaClient } from "@/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:  process.env.GOOGLE_CLIENT_ID  || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    //@ts-ignore
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      try {
        // Create the user if they don’t exist; otherwise do nothing
        await prismaClient.user.upsert({
          where:  { email: user.email },
          update: {},          
          create: {
            email:    user.email,
            provider: "Google"
          },
        });
      } catch (err) {
        console.error("Error upserting user:", err);
        // We still return true, because even if upsert somehow fails,
        // we don’t want to block the login.
      }
      return true;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
